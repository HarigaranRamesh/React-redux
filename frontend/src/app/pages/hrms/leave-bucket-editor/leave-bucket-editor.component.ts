import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UserService } from '../services/user/user.service';
import { LeaveTypeApiService } from '../services/leave-type/leave-type.service';

type YearBucket = { year: number; months: number[]; annualValue?: number };

type LeaveTypeDoc = {
  _id: string;
  userId: any;
  label: string;
  value: number;
  accrualType: string; // monthly/annual/fixed (can come any case)
  doj?: any;
  remaining: YearBucket[];
};

@Component({
  selector: 'app-leave-bucket-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    DropdownModule,
    ButtonModule,
    TableModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './leave-bucket-editor.component.html'
})
export class LeaveBucketEditorComponent {
  // -------------------- User AutoComplete --------------------
  selectedUser: any = null;
  filteredUsers: any[] = [];
  loadingUsers = false;

  // -------------------- Leave docs --------------------
  leaveDocs: LeaveTypeDoc[] = [];
  selectedLeaveDoc: LeaveTypeDoc | null = null;

  // -------------------- Accrual dropdown (edit) --------------------
  accrualOptions = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Annual', value: 'annual' },
    { label: 'Fixed', value: 'fixed' }
  ];
  selectedAccrual: 'monthly' | 'annual' | 'fixed' = 'monthly';

  // -------------------- Year + Month (edit) --------------------
  years: { label: string; value: number }[] = [];
  selectedYear: number | null = null;

  months = [
    { label: 'Jan', value: 0 }, { label: 'Feb', value: 1 }, { label: 'Mar', value: 2 },
    { label: 'Apr', value: 3 }, { label: 'May', value: 4 }, { label: 'Jun', value: 5 },
    { label: 'Jul', value: 6 }, { label: 'Aug', value: 7 }, { label: 'Sep', value: 8 },
    { label: 'Oct', value: 9 }, { label: 'Nov', value: 10 }, { label: 'Dec', value: 11 }
  ];
  selectedMonth: number | null = null;

  // -------------------- Editing values (edit panel) --------------------
  monthValue = 0;
  annualValue = 0;

  saving = false;

  // -------------------- Create New Leave Type --------------------
  createMode = false;

  defaultPolicyOptions = [
    'Sick Leave',
    'Casual Leave',
    'Planned Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Compoff Leave'
  ].map(x => ({ label: x, value: x }));

  newLeave = {
    label: '',
    accrualType: 'monthly' as 'monthly' | 'annual' | 'fixed',
    initialValue: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth(), // 0-11
    doj: null as any
  };

  constructor(
    private userService: UserService,
    private leaveApi: LeaveTypeApiService,
    private messageService: MessageService
  ) {}

  // -------------------- Helpers --------------------
  private normalizeAccrual(v: any): 'monthly' | 'annual' | 'fixed' {
    const s = String(v || '').toLowerCase().trim();
    if (s === 'annual' || s === 'yearly') return 'annual';
    if (s === 'fixed') return 'fixed';
    return 'monthly';
  }

  private toDocShape(d: any): LeaveTypeDoc {
    return {
      ...d,
      accrualType: this.normalizeAccrual(d.accrualType),
      remaining: Array.isArray(d.remaining)
        ? d.remaining.map((b: any) => ({
            year: Number(b.year),
            months: Array.isArray(b.months) && b.months.length === 12 ? b.months : Array(12).fill(0),
            annualValue: Number(b.annualValue ?? 0)
          }))
        : []
    };
  }

  private ensureBucket(doc: LeaveTypeDoc, year: number): YearBucket {
    let bucket = (doc.remaining || []).find(b => b.year === year);
    if (!bucket) {
      bucket = { year, months: Array(12).fill(0), annualValue: 0 };
      doc.remaining = [...(doc.remaining || []), bucket];
    }
    if (!Array.isArray(bucket.months) || bucket.months.length !== 12) {
      bucket.months = Array(12).fill(0);
    }
    bucket.annualValue = Number(bucket.annualValue ?? 0);
    return bucket;
  }

  private hasLeaveLabel(label: string) {
    const s = (label || '').trim().toLowerCase();
    return this.leaveDocs.some(d => (d.label || '').trim().toLowerCase() === s);
  }

  // -------------------- User AutoComplete --------------------
  filterUsers(event: any) {
    const query = (event.query || '').trim();
    if (!query) {
      this.filteredUsers = [];
      return;
    }
    this.loadingUsers = true;

    this.userService.searchUsers(query, 1, 10).subscribe({
      next: (res) => {
        const list = res?.data || res?.users || res?.results || [];
        this.filteredUsers = list;
        this.loadingUsers = false;
      },
      error: () => {
        this.loadingUsers = false;
        this.filteredUsers = [];
      }
    });
  }

  onUserSelect() {
    if (!this.selectedUser?._id) return;

    this.leaveDocs = [];
    this.selectedLeaveDoc = null;
    this.createMode = false;

    this.leaveApi.getLeaveTypesByUserId(this.selectedUser._id).subscribe({
      next: (res) => {
        const docs: any[] = res?.data || res || [];
        this.leaveDocs = (docs || []).map(d => this.toDocShape(d));

        if (!this.leaveDocs.length) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Data',
            detail: 'No leave records found for this user.'
          });
          return;
        }

        this.selectLeaveDoc(this.leaveDocs[0]);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Failed to load leave data.'
        });
      }
    });
  }

  // -------------------- Select + Edit --------------------
  selectLeaveDoc(doc: LeaveTypeDoc) {
    this.selectedLeaveDoc = doc;

    // set accrual dropdown
    this.selectedAccrual = this.normalizeAccrual(doc.accrualType);

    const years = (doc.remaining || []).map(b => b.year).sort((a, b) => b - a);
    this.years = years.map(y => ({ label: String(y), value: y }));

    const currentYear = new Date().getFullYear();
    this.selectedYear = years.includes(currentYear) ? currentYear : (years[0] ?? currentYear);

    this.selectedMonth = new Date().getMonth();
    this.loadEditValues();
  }

  onAccrualChange() {
    this.loadEditValues();
  }

  onYearChange() {
    this.loadEditValues();
  }

  onMonthChange() {
    this.loadEditValues();
  }

  loadEditValues() {
    const doc = this.selectedLeaveDoc;
    if (!doc || this.selectedYear == null) return;

    const bucket = this.ensureBucket(doc, this.selectedYear);

    if (this.selectedAccrual === 'annual') {
      this.annualValue = Number(bucket.annualValue || 0);
    } else {
      const m = this.selectedMonth ?? 0;
      this.monthValue = Number(bucket.months[m] || 0);
    }
  }

  // -------------------- SAVE (update existing) --------------------
  onSave() {
    const doc = this.selectedLeaveDoc;
    if (!doc || this.selectedYear == null) return;

    const year = this.selectedYear;
    const month = this.selectedMonth ?? 0;

    // clone remaining safely
    const remaining: YearBucket[] = (doc.remaining || []).map(b => ({
      year: b.year,
      months: Array.isArray(b.months) && b.months.length === 12 ? [...b.months] : Array(12).fill(0),
      annualValue: Number(b.annualValue ?? 0)
    }));

    let bucket = remaining.find(b => b.year === year);
    if (!bucket) {
      bucket = { year, months: Array(12).fill(0), annualValue: 0 };
      remaining.push(bucket);
    }

    // update based on selected accrual
    if (this.selectedAccrual === 'annual') {
      bucket.annualValue = Number(this.annualValue || 0);
    } else {
      bucket.months[month] = Number(this.monthValue || 0);
    }

    // compute total value
    let newValue = doc.value;
    if (this.selectedAccrual === 'annual') {
      newValue = Number(bucket.annualValue || 0);
    } else {
      newValue = bucket.months.reduce((s, n) => s + Number(n || 0), 0);
    }

    const payload = {
      userId: doc.userId,
      label: doc.label,
      value: newValue,
      accrualType: this.selectedAccrual,
      doj: doc.doj,
      remaining
    };

    this.saving = true;
    this.leaveApi.updateLeaveType(doc._id, payload).subscribe({
      next: () => {
        this.saving = false;

        // update local doc
        doc.accrualType = this.selectedAccrual;
        doc.remaining = remaining;
        doc.value = newValue;

        // refresh year dropdown list
        const years = (doc.remaining || []).map(b => b.year).sort((a, b) => b - a);
        this.years = years.map(y => ({ label: String(y), value: y }));

        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Leave updated successfully.' });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Update failed.'
        });
      }
    });
  }

  // -------------------- CREATE NEW LEAVE TYPE --------------------
  toggleCreate() {
    this.createMode = !this.createMode;
    if (this.createMode) {
      // reset create form when opening
      this.newLeave = {
        label: '',
        accrualType: 'monthly',
        initialValue: 0,
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        doj: null
      };
    }
  }

  onCreateLeaveType() {
    if (!this.selectedUser?._id) {
      this.messageService.add({ severity: 'warn', summary: 'Select User', detail: 'Please select a user first.' });
      return;
    }

    const label = (this.newLeave.label || '').trim();
    if (!label) {
      this.messageService.add({ severity: 'warn', summary: 'Label Required', detail: 'Enter a leave type name.' });
      return;
    }

    if (this.hasLeaveLabel(label)) {
      this.messageService.add({ severity: 'warn', summary: 'Duplicate', detail: 'This leave type already exists for this user.' });
      return;
    }

    const year = Number(this.newLeave.year || new Date().getFullYear());
    const month = Number(this.newLeave.month ?? new Date().getMonth());

    const monthsArr = Array(12).fill(0);
    let annualValue = 0;

    if (this.newLeave.accrualType === 'annual') {
      annualValue = Number(this.newLeave.initialValue || 0);
    } else {
      monthsArr[month] = Number(this.newLeave.initialValue || 0);
    }

    const value = this.newLeave.accrualType === 'annual'
      ? annualValue
      : monthsArr.reduce((s, n) => s + Number(n || 0), 0);

    const payload = {
      userId: this.selectedUser._id,
      label,
      accrualType: this.newLeave.accrualType,
      doj: this.newLeave.doj,
      remaining: [{ year, months: monthsArr, annualValue }],
      value
    };

    this.saving = true;
    this.leaveApi.createLeaveType(payload).subscribe({
      next: () => {
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Created', detail: 'Leave type created successfully.' });

        // refresh list
        this.onUserSelect();

        this.createMode = false;
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'Create failed.'
        });
      }
    });
  }
}
