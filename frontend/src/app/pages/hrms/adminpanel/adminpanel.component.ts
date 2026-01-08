import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { EmployeeProfileComponent } from "../employee-profile/employee-profile.component";
import { UserService } from '../services/user/user.service';
type ProfileTile = { label: string; value: number | string; color?: string };

@Component({
  selector: 'app-adminpanel',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DialogModule,
    PasswordModule,
    ToastModule,
    ReactiveFormsModule,
    EmployeeProfileComponent
  ],
  templateUrl: './adminpanel.component.html',
  styleUrls: ['./adminpanel.component.scss'],
  providers: [MessageService]
})
export class AdminpanelComponent implements OnInit {
  totalEmployees = 0;
  activeEmployees = 0;
  inactiveEmployees = 0;
  presentToday = 0;
  absentToday = 0;

  profile: any = null;
  profileStats = {
    availableLeaves: 0,
    presentDays: 0,
    absentDays: 0,
    pendingLeaves: 0,
    balancePetrol: 0,
    lastLogin: ''
  };

  profileTiles: ProfileTile[] = [];
  userRole: string = '';
  isAdminOrSuperAdmin = false;

  checkstatus: boolean = false;
  logoutTime: boolean = false;
  loading = false;

  showChangePassword = false;
  changeForm!: FormGroup;
  savingPwd = false;

  private tileColorMap: Record<string, string> = {
    'Available Leaves': 'text-green-600',
    'Present Days (This Month)': 'text-blue-500',
    'Absent Days': 'text-red-500',
    'Pending Leave Requests': 'text-orange-500'
  };

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  async ngOnInit(): Promise<void> {
    this.userRole = localStorage.getItem('userRole') || '';
    this.isAdminOrSuperAdmin = this.userRole === 'Super Admin';

    this.changeForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.matchPasswordsValidator('newPassword', 'confirmPassword') }
    );

    if (this.isAdminOrSuperAdmin) {
      this.loadDashboardStats();
    } else {
      this.loadProfile();
    }

    const logoutTime = new Date();
    this.logoutTime = logoutTime.getHours() >= 17;

    await this.check();
  }

  // -------- Admin Dashboard --------
  loadDashboardStats() {
    this.userService.getDashboardStats().subscribe({
      next: (data) => {
        this.totalEmployees = data.totalEmployees;
        this.activeEmployees = data.activeEmployees;
        this.inactiveEmployees = data.inactiveEmployees;
        this.presentToday = data.presentToday;
        this.absentToday = data.absentToday;
      }
    });
  }

  // -------- Profile --------
  loadProfile() {
    const id = localStorage.getItem('userId');
    if (!id) return;

    this.userService.getProfile(id).subscribe(profile => {
      this.profile = profile;
      this.profileStats.availableLeaves = profile.availableLeaves;
      this.profileStats.presentDays = profile.presentDays;
      this.profileStats.absentDays = profile.absentDays;
      this.profileStats.pendingLeaves = profile.pendingLeaves;
      this.profileStats.lastLogin = profile.lastLogin;

      this.userService.getPetrolBalance(id).subscribe(p => this.profileStats.balancePetrol = p.totalAmount || 0);
      this.userService.getLeaveTiles(id).subscribe(res => this.profileTiles = res || []);
    });
  }

  // -------- Attendance --------
  login() {
    if (this.loading) return;
    this.loading = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const payload = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          this.userService.loginAttendance(payload).subscribe({
            next: () => {
              this.checkstatus = true;
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Clock-in successful' });
              this.loading = false;
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Clock-in failed' });
              this.loading = false;
            }
          });
        },
        () => {
          this.messageService.add({ severity: 'warn', summary: 'Location Error', detail: 'Enable GPS' });
          this.loading = false;
        }
      );
    }
  }

  logout() {
    if (this.loading) return;
    this.loading = true;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const payload = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          this.userService.logoutAttendance(payload).subscribe({
            next: () => {
              this.checkstatus = false;
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Clock-out successful' });
              this.loading = false;
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Clock-out failed' });
              this.loading = false;
            }
          });
        },
        () => {
          this.messageService.add({ severity: 'warn', summary: 'Location Error', detail: 'Enable GPS' });
          this.loading = false;
        }
      );
    }
  }

  async check(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    return new Promise((resolve) => {
      this.userService.checkAttendance().subscribe({
        next: (res) => {
          this.checkstatus = res?.message;
          this.loading = false;
          resolve();
        },
        error: () => {
          this.loading = false;
          resolve();
        }
      });
    });
  }

  // -------- Change password --------
  openChangePassword() {
    this.changeForm.reset();
    this.showChangePassword = true;
  }

  submitChangePassword() {
    if (this.changeForm.invalid) {
      this.changeForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.changeForm.value;
    this.savingPwd = true;

    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.savingPwd = false;
        this.showChangePassword = false;
        this.messageService.add({ severity: 'success', summary: 'Password Updated', detail: 'Your password has been changed.' });
      },
      error: (err) => {
        this.savingPwd = false;
        const detail = err?.error?.message || 'Failed to change password';
        this.messageService.add({ severity: 'error', summary: 'Error', detail });
      }
    });
  }

  // -------- Validators --------
  private passwordStrengthValidator() {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const v = String(control.value || '');
      if (!v) return null;
      return regex.test(v) ? null : { weak: true };
    };
  }

  private matchPasswordsValidator(p1: string, p2: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const a = group.get(p1)?.value;
      const b = group.get(p2)?.value;
      if (!a || !b) return null;
      return a === b ? null : { mismatch: true };
    };
  }

  // -------- Helpers --------
  getColorClass(label: string): string {
    return this.tileColorMap[label] || '';
  }

  trackByLabel = (_: number, t: ProfileTile) => t.label;
}
