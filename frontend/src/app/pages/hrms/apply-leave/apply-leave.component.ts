import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AttendanceService } from '../services/attendance/attendance.service';

type OccurrenceResponse = { dates?: string[]; items?: Array<{ date: string; name?: string }> };
type HolidayCheck = { isHoliday: boolean; name?: string };

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    DatePickerModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './apply-leave.component.html',
  styleUrls: ['./apply-leave.component.scss']
})
export class ApplyLeaveComponent implements OnInit {
  leaveForm!: FormGroup;

  leaveTypes = [
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Planned Leave', value: 'Planned Leave' },
    { label: 'Maternity Leave', value: 'Maternity Leave' },
    { label: 'Comp OFF', value: 'Comp OFF' }
  ];

  disabledDatesStart: Date[] = [];
  disabledDatesEnd: Date[] = [];
  private startHolidaySet = new Set<string>();
  private endHolidaySet = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      leaveType: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate:   [null, Validators.required],
      reason:    ['', [Validators.required, Validators.minLength(5)]],
    });

    const now = new Date();
    this.loadMonthHolidays('start', now.getFullYear(), now.getMonth());
    this.loadMonthHolidays('end',   now.getFullYear(), now.getMonth());
  }

  // --- Submit ---
  submitLeaveRequest() {
    if (this.leaveForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields' });
      return;
    }

    const start: Date = this.leaveForm.value.startDate;
    const end:   Date = this.leaveForm.value.endDate;

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
    };

    this.attendanceService.applyLeave(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Leave request submitted' });
        this.leaveForm.reset();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit leave request' });
      }
    });
  }

  // --- Calendar handlers ---
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

    this.attendanceService.checkHoliday(this.toISO(date)).subscribe({
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

    this.attendanceService.checkHoliday(this.toISO(date)).subscribe({
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

  // --- Holidays fetching ---
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

  // --- Utils ---
  private extractDate(ev: any): Date | null {
    const raw = ev instanceof Date ? ev : ev?.value ?? ev;
    if (!raw) return null;
    const dt = raw instanceof Date ? raw : new Date(raw);
    return isNaN(+dt) ? null : dt;
  }

  private toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private isHolidayLocal(target: 'start' | 'end', date: Date | null): boolean {
    if (!date) return false;
    const iso = this.toISO(date);
    return target === 'start' ? this.startHolidaySet.has(iso) : this.endHolidaySet.has(iso);
  }
}
