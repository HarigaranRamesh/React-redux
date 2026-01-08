import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { HttpHeaders } from '@angular/common/http';

import { LeaveService, HolidayCheck, OccurrenceResponse } from '../services/leave/leave.service';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss'],
  providers: [MessageService]
})
export class LeaveRequestComponent implements OnInit {
  leaveForm!: FormGroup;

  leaveTypes = [
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Planned Leave', value: 'Planned Leave' },
    { label: 'Maternity Leave', value: 'Maternity Leave' },
    { label: 'Comp OFF', value: 'Comp OFF' }
  ];

  currentUserId = localStorage.getItem('userId') || 'user-id';

  // Holidays (disable + quick local guard)
  disabledDatesStart: Date[] = [];
  disabledDatesEnd: Date[] = [];
  private startHolidaySet = new Set<string>();
  private endHolidaySet = new Set<string>();

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.leaveForm = this.fb.group({
      leaveType:  [null, Validators.required],
      startDate:  [null, Validators.required],
      endDate:    [null, Validators.required],
      reason:     ['', [Validators.required, Validators.minLength(5)]],
    });

    // Preload current month holidays
    const now = new Date();
    this.loadMonthHolidays('start', now.getFullYear(), now.getMonth());
    this.loadMonthHolidays('end',   now.getFullYear(), now.getMonth());
  }

  // ---------- Submit ----------
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

    // Final holiday guard
    if (this.isHolidayLocal('start', start) || this.isHolidayLocal('end', end)) {
      this.messageService.add({ severity: 'error', summary: 'Invalid Dates', detail: 'Selected date falls on a holiday' });
      return;
    }

    const payload = {
      ...this.leaveForm.value,
      userId: this.currentUserId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      status: 'Pending'
    };

    this.leaveService.submitLeave(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Leave request submitted' });
        this.leaveForm.reset();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to submit leave request' });
      }
    });
  }

  // ---------- Calendar: month change ----------
  onStartMonthChange(e: any) {
    const m = e?.month, y = e?.year;
    if (typeof m === 'number' && typeof y === 'number') {
      this.loadMonthHolidays('start', y, m);
    }
  }
  onEndMonthChange(e: any) {
    const m = e?.month, y = e?.year;
    if (typeof m === 'number' && typeof y === 'number') {
      this.loadMonthHolidays('end', y, m);
    }
  }

  // ---------- Calendar: date select ----------
  onStartSelect(ev: any) {
    const date = this.extractDate(ev);
    if (!date) return;

    if (this.isHolidayLocal('start', date)) {
      this.blockStartSelection(date, 'Holiday (cached)');
      return;
    }

    this.leaveService.checkHoliday(this.toISO(date)).subscribe({
      next: (res) => {
        if (res?.isHoliday) {
          this.blockStartSelection(date, res.name || 'Holiday');
        } else {
          this.loadMonthHolidays('end', date.getFullYear(), date.getMonth());
        }
      },
      error: () => {
        if (this.isHolidayLocal('start', date)) {
          this.blockStartSelection(date, 'Holiday');
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

    this.leaveService.checkHoliday(this.toISO(date)).subscribe({
      next: (res) => {
        if (res?.isHoliday) {
          this.blockEndSelection(date, res.name || 'Holiday');
        }
      },
      error: () => {
        if (this.isHolidayLocal('end', date)) {
          this.blockEndSelection(date, 'Holiday');
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

  // ---------- Holidays fetch ----------
  private loadMonthHolidays(target: 'start' | 'end', year: number, month: number) {
    this.leaveService.getMonthHolidays(year, month).subscribe({
      next: (res: OccurrenceResponse) => {
        const isoDates =
          (res && Array.isArray(res.dates)) ? res.dates :
          Array.isArray((res as any)) ? (res as any) : [];
        const arr = isoDates.map(iso => new Date(iso + 'T00:00:00'));
        if (target === 'start') {
          this.disabledDatesStart = arr;
          this.startHolidaySet = new Set(isoDates);
        } else {
          this.disabledDatesEnd = arr;
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
