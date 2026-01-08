import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnInit, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { UserService } from '../services/user/user.service';
import { HolidayCalendarViewComponent } from "../holiday-calendar-view/holiday-calendar-view.component";
import { AccessViewComponent } from "../access-view/access-view.component";
import { ConfirmDialog } from "primeng/confirmdialog";

type AttendanceSummary = { presentDays: number; absentDays: number; lateMarks?: number; isHoliday?: boolean; };
type LeaveBalance = {
tag: any; type: string; balance: number; color?: string;
};
type Project = { name: string; role: string; status: 'Active' | 'On Hold' | 'Completed'; };
type EmployeeProfile = {
  _id: string; user_name: string; empId: string; email: string;
  mobile_no: string; position: string; department?: string; doj: string | Date;
  status: boolean; photoUrl?: string; coverUrl?: string; location?: string;
  managerName?: string; skills?: string[]; bio?: string;
};

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    CardModule, AvatarModule, ButtonModule, TagModule, ChipModule,
    DividerModule, TabViewModule, TableModule, ToastModule,
    DialogModule, PasswordModule,
    HolidayCalendarViewComponent,
    AccessViewComponent,
    ConfirmDialog
],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
  providers: [MessageService,ConfirmationService]
})
export class EmployeeProfileComponent implements OnInit {
  @Input() userId?: string;

  private _profile = signal<EmployeeProfile | null>(null);
  profile = computed(() => this._profile());

  private _attendance = signal<AttendanceSummary | null>(null);
  attendance = computed(() => this._attendance());

  private _leaves = signal<LeaveBalance[]>([]);
  leaves = computed(() => this._leaves());

  private _projects = signal<Project[]>([]);
  projects = computed(() => this._projects());

  private _petrolBalance = signal<number>(0);
  petrolBalance = computed(() => this._petrolBalance());

  checkStatus = false;
  loading = false;
  isHoliday: boolean = false;

  showChangePwd = false;
  submittingPwd = false;
  pwdForm!: FormGroup;

  constructor(
    private userService: UserService,
    private toast: MessageService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = this.userId || localStorage.getItem('userId') || '';
    if (!id) {
      this.toast.add({severity:'warn', summary:'Missing ID', detail:'No userId provided.'});
      return;
    }

    this.pwdForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });

    this.userService.getProfile(id).subscribe({
      next: (data) => this._profile.set(data),
      error: () => this.toast.add({severity:'error', summary:'Error', detail:'Failed to load profile'})
    });

    this.userService.getAttendanceSummary(id).subscribe({
      next: (data) => { this._attendance.set(data); this.isHoliday = !!data?.isHoliday; },
      error: () => { this._attendance.set({ presentDays: 0, absentDays: 0, lateMarks: 0, isHoliday: false }); this.isHoliday = false; }
    });

 this.userService.getLeaveTiles(id).subscribe({
  next: (list) => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    const transformed = list.map(l => {

      // find year bucket
      const bucket = (l.remaining || []).find((b: any) => b.year === currentYear);

      if (!bucket) {
        return {
          type: l.label,
          balance: 0,
          tag: '(no bucket)'
        };
      }

      const accrual = (l.accrualType || '').toLowerCase();
      let balance = 0;
      let tag = '';

      // MONTHLY -----------------------------------------------------
      if (accrual === 'monthly') {
        balance = bucket.months[currentMonth] ?? 0;
        tag = '/ monthly (this month)';
      }

      // ANNUAL ------------------------------------------------------
      else if (accrual === 'annual') {
        balance = bucket.annualValue ?? l.value ?? 0;
        tag = '/ annual';
      }

      // FIXED -------------------------------------------------------
      else if (accrual === 'fixed') {
        const dojMonth = l.doj ? new Date(l.doj).getMonth() : currentMonth;
        balance = bucket.months[dojMonth] ?? l.value ?? 0;
        tag = '/ fixed';
      }

      return {
        type: l.label,
        balance: balance,
        tag: tag
      };
    });

    this._leaves.set(transformed);
  },
  error: () => this._leaves.set([])
});


    this.userService.getPetrolBalance(id).subscribe({
      next: (petrol) => this._petrolBalance.set(petrol?.totalAmount || 0),
      error: () => this._petrolBalance.set(0)
    });

    this._projects.set([
      { name: 'HRMS Portal', role: 'Frontend Dev', status: 'Active' },
      { name: 'CRM Revamp', role: 'Reviewer', status: 'On Hold' },
      { name: 'LeadTek POC', role: 'Contributor', status: 'Completed' },
    ]);

    this.refreshClockStatus();
  }

  private refreshClockStatus() {
    this.userService.checkAttendance().subscribe({
      next: (res: any) => { this.checkStatus = !!res?.message; this.isHoliday = !!res?.isHoliday; },
      error: () => this.checkStatus = false
    });
  }

  clockIn() {
    if (this.loading) return;
    this.loading = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const payload = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          this.userService.loginAttendance(payload).subscribe({
            next: () => { this.checkStatus = true; this.toast.add({ severity: 'success', summary: 'Clock In', detail: 'You have clocked in successfully' }); this.loading = false; },
            error: () => { this.toast.add({ severity: 'error', summary: 'Clock In Failed', detail: 'Unable to mark attendance' }); this.loading = false; }
          });
        },
        () => { this.toast.add({ severity: 'warn', summary: 'Location Error', detail: 'Please enable GPS/location' }); this.loading = false; }
      );
    }
  }

  clockOut() {
    if (this.loading) return;
    this.loading = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const payload = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          this.userService.logoutAttendance(payload).subscribe({
            next: () => { this.checkStatus = false; this.toast.add({ severity: 'success', summary: 'Clock Out', detail: 'You have clocked out successfully' }); this.loading = false; },
            error: () => { this.toast.add({ severity: 'error', summary: 'Clock Out Failed', detail: 'Unable to mark attendance' }); this.loading = false; }
          });
        },
        () => { this.toast.add({ severity: 'warn', summary: 'Location Error', detail: 'Please enable GPS/location' }); this.loading = false; }
      );
    }
  }

  confirmClockOut() {
    this.confirmationService.confirm({
      message: this.isHoliday ?
        'You are clocking out on a holiday. Do you want to proceed?' :
        'Are you sure you want to clock out?',
      header: 'Confirm Clock Out',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Clock Out',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-text',
      accept: () => this.clockOut(), // ✅ Call clockOut only if confirmed
    });
  }

  openChangePassword() {
    this.pwdForm.reset();
    this.showChangePwd = true;
  }

  private passwordsMatchValidator(group: FormGroup) {
    const n = group.get('newPassword')?.value;
    const c = group.get('confirmPassword')?.value;
    return n && c && n === c ? null : { mismatch: true };
  }

  submitChangePassword() {
    if (this.pwdForm.invalid) {
      this.pwdForm.markAllAsTouched();
      return;
    }
    this.submittingPwd = true;
    const { currentPassword, newPassword } = this.pwdForm.value;
    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: () => { this.toast.add({ severity: 'success', summary: 'Password updated', detail: 'Your password has been changed.' }); this.submittingPwd = false; this.showChangePwd = false; },
      error: (err) => { const msg = err?.error?.message || 'Failed to change password'; this.toast.add({ severity: 'error', summary: 'Error', detail: msg }); this.submittingPwd = false; }
    });
  }

  coverStyle(): string {
    const url = this.profile()?.coverUrl;
    return url ? `url('${url}')` : `linear-gradient(135deg,#1f2937,#0ea5e9)`;
  }

  getProfilePhoto(): string {
    const url = this.profile()?.photoUrl;
    if (url && url.trim() !== '') return url;
    const safeName = encodeURIComponent(this.profile()?.user_name || 'Employee');
    return `https://ui-avatars.com/api/?name=${safeName}&background=random&size=64&bold=true`;
  }




}
