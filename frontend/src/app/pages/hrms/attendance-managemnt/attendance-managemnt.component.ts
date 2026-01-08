import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { AttendanceService } from '../services/attendance/attendance.service';
import { FileUploadModule } from 'primeng/fileupload'; // ✅ add this import

type OccurrenceResponse = { dates?: string[]; items?: Array<{ date: string; name?: string }> };
type HolidayCheck = { isHoliday: boolean; name?: string };

@Component({
  selector: 'app-attendance-managemnt',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    ReactiveFormsModule,
    DropdownModule,
    DatePickerModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    TabViewModule,
    FloatLabelModule,
    TextareaModule,
    TableModule
  ],
  templateUrl: './attendance-managemnt.component.html',
  styleUrl: './attendance-managemnt.component.scss',
  providers: [MessageService]
})
export class AttendanceManagemntComponent implements OnInit {
  tomorrow: Date = new Date();
 minStartDate: Date = new Date(); // ✅ dynamic for sick leave
  selectedFile: File | null = null; // ✅ store selected file
  leaveForm!: FormGroup;
  leaveRequests: any[] = [];
  currentUserId: any = '';

  disabledDatesStart: Date[] = [];
  disabledDatesEnd: Date[] = [];
  private startHolidaySet = new Set<string>();
  private endHolidaySet = new Set<string>();

  leaveTypes = [
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Planned Leave', value: 'Planned Leave' },
    { label: 'Maternity Leave', value: 'Maternity Leave' },
  ];

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private messageService: MessageService
  ) {}
 onLeaveTypeChange(event: any) {
    const selectedType = event?.value;

    if (selectedType === 'Sick Leave') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      this.minStartDate = oneMonthAgo; // allow 1 month back
    } else {
      this.minStartDate = new Date();
      this.minStartDate.setDate(this.minStartDate.getDate() + 1);
    }
  }

  // ✅ handle file select (only for Sick Leave)
  onFileSelect(event: any) {
    this.selectedFile = event?.files?.[0] || null;
  }
  ngOnInit(): void {
    this.tomorrow = new Date();
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
    this.minStartDate = this.tomorrow; // default

    this.currentUserId = localStorage.getItem('userId') || '';

    this.leaveForm = this.fb.group({
      leaveType: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
    });

    const now = new Date();
    this.loadMonthHolidays('start', now.getFullYear(), now.getMonth());
    this.loadMonthHolidays('end',   now.getFullYear(), now.getMonth());

    this.getLeaveRequests();
  }

  // ---------- Submit ----------
  submitLeaveRequest() {
    if (this.leaveForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      return;
    }

    const start: Date = this.leaveForm.value.startDate;
    const end: Date   = this.leaveForm.value.endDate;

    if (end < start) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'End date cannot be before Start date' });
      return;
    }

    if (this.isHolidayLocal('start', start) || this.isHolidayLocal('end', end)) {
      this.messageService.add({ severity: 'error', summary: 'Invalid Dates', detail: 'Selected date falls on a holiday' });
      return;
    }

    const payload = {
      attendanceType: this.leaveForm.value.leaveType,
      reasonForApplying: this.leaveForm.value.reason,
      fromDate: this.toISO(start),
      toDate: this.toISO(end),
      userId: this.currentUserId
    };

    this.attendanceService.applyLeave(payload).subscribe({
      next: (data: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: data?.message || 'Leave request submitted' });
        this.leaveForm.reset();
        this.getLeaveRequests();
      },
      error: (err: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to submit leave request' });
      }
    });
  }

  // ---------- Fetch Leave Requests ----------
  getLeaveRequests() {
    this.attendanceService.getLeaveRequests(this.currentUserId).subscribe({
      next: (res: any) => {
        this.leaveRequests = res?.data || [];
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load leave requests' });
      }
    });
  }

  // ---------- Calendar handlers ----------
  onStartMonthChange(e: any) {
    if (typeof e?.month === 'number' && typeof e?.year === 'number') {
      this.loadMonthHolidays('start', e.year, e.month);
    }
  }

  onEndMonthChange(e: any) {
    if (typeof e?.month === 'number' && typeof e?.year === 'number') {
      this.loadMonthHolidays('end', e.year, e.month);
    }
  }

  onStartSelect(ev: any) {
    const date = this.extractDate(ev);
    if (!date) return;

    if (this.isHolidayLocal('start', date)) {
      this.blockStartSelection(date, 'Holiday (cached)');
      return;
    }

    this.attendanceService.checkHoliday(this.toISOholi(date)).subscribe({
      next: (res: HolidayCheck) => {
        if (res?.isHoliday) {
          this.blockStartSelection(date, res.name || 'Holiday');
        } else {
          this.loadMonthHolidays('end', date.getFullYear(), date.getMonth());
        }
      }
    });
  }

  onEndSelect(ev: any) {
    const date = this.extractDate(ev);
    if (!date) return;

    if (this.isHolidayLocal('end', date)) {
      this.blockEndSelection(date, 'Holiday (cached)');
      return;
    }

    this.attendanceService.checkHoliday(this.toISOholi(date)).subscribe({
      next: (res: HolidayCheck) => {
        if (res?.isHoliday) {
          this.blockEndSelection(date, res.name || 'Holiday');
        }
      }
    });
  }

  private blockStartSelection(date: Date, reason: string) {
    this.leaveForm.get('startDate')?.setValue(null);
    this.messageService.add({ severity: 'warn', summary: 'Not allowed', detail: `Start date (${this.toISO(date)}) is ${reason}.` });
  }

  private blockEndSelection(date: Date, reason: string) {
    this.leaveForm.get('endDate')?.setValue(null);
    this.messageService.add({ severity: 'warn', summary: 'Not allowed', detail: `End date (${this.toISO(date)}) is ${reason}.` });
  }

  // ---------- Holidays fetch/logic ----------
  private loadMonthHolidays(target: 'start' | 'end', year: number, month: number) {
    this.attendanceService.getMonthHolidays(year, month).subscribe({
      next: (res: OccurrenceResponse) => {
        const isoDates = Array.isArray(res?.dates) ? res.dates : [];
        const dates = isoDates.map(iso => new Date(iso + 'T00:00:00'));
        if (target === 'start') {
          this.disabledDatesStart = dates;
          this.startHolidaySet = new Set(isoDates);
        } else {
          this.disabledDatesEnd = dates;
          this.endHolidaySet = new Set(isoDates);
        }
      },
      error: () => {
        if (target === 'start') { this.disabledDatesStart = []; this.startHolidaySet.clear(); }
        else { this.disabledDatesEnd = []; this.endHolidaySet.clear(); }
      }
    });
  }

  // ---------- Utils ----------
  private extractDate(ev: any): Date | null {
    const raw = ev instanceof Date ? ev : ev?.value ?? ev;
    if (!raw) return null;
    const dt = raw instanceof Date ? raw : new Date(raw);
    return isNaN(+dt) ? null : dt;
  }



   private toISO(date: Date): string {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

     private toISOholi(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isHolidayLocal(target: 'start' | 'end', date: Date | null): boolean {
    if (!date) return false;
    const iso = this.toISOholi(date);
    return target === 'start' ? this.startHolidaySet.has(iso) : this.endHolidaySet.has(iso);
  }
}
