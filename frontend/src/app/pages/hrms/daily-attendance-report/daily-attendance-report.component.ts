import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DailyAttendanceService } from '../services/reports/daily-attendance.service';

@Component({
  selector: 'app-daily-attendance-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    CalendarModule
  ],
  templateUrl: './daily-attendance-report.component.html',
  styleUrls: ['./daily-attendance-report.component.scss'],
  providers: [MessageService]
})
export class DailyAttendanceReportComponent implements OnInit {
  attendanceList: any[] = [];
  total: number = 0;
  limit: number = 10;
  loading = false;
  searchText: string = '';

  reportDate: Date = new Date(); // default today
  mode: 'live' | 'append' | 'monthly' = 'live';

  approvalDialog: boolean = false;
  selectedAttendance: any = null;

  constructor(
    private dailyService: DailyAttendanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadLive();
  }

  // Convert date → yyyy-mm-dd
  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Load Live Report
  loadLive(page: number = 1) {
    this.loading = true;
    const dateStr = this.formatDate(this.reportDate);

    this.dailyService.getDayReport(dateStr, page, this.limit).subscribe({
      next: (res) => {
        this.attendanceList = res.data;
        this.total = res.total;
        this.mode = 'live';
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  // Append Daily Report
  appendReport(page: number = 1) {
    this.loading = true;
    const dateStr = this.formatDate(this.reportDate);

    this.dailyService.appendDayReport(dateStr, page, this.limit).subscribe({
      next: (res) => {
        this.attendanceList = res.data;
        this.total = res.total;
        this.mode = 'append';
        this.messageService.add({
          severity: 'success',
          summary: 'Snapshot',
          detail: `Daily snapshot: ${res.mode}`
        });
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  // Monthly Report
  loadMonthly(page: number = 1) {
    this.loading = true;
    const year = this.reportDate.getFullYear();
    const month = this.reportDate.getMonth() + 1;

    this.dailyService.getPersistedMonthlyReport(year, month, page, this.limit).subscribe({
      next: (res) => {
        this.attendanceList = res.data;
        this.total = res.total;
        this.mode = 'monthly';
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  // Review dialog
  openApprovalDialog(attendance: any) {
    this.selectedAttendance = attendance;
    this.approvalDialog = true;
  }

  // Manager override → Present
  markAsPresent() {
    if (!this.selectedAttendance?._id) return;
    this.dailyService.overridePresent(this.selectedAttendance._id, "Manager override to Present").subscribe({
      next: (res) => {
        const updated = res.data;
        const idx = this.attendanceList.findIndex(a => a._id === updated._id);
        if (idx >= 0) this.attendanceList[idx] = updated;

        this.messageService.add({
          severity: 'success',
          summary: 'Overridden',
          detail: 'Attendance marked as Present'
        });
        this.approvalDialog = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to override attendance'
        });
      }
    });
  }

  // Reject Attendance (simple toggle)
  rejectAttendance() {
    if (!this.selectedAttendance?._id) return;
    this.dailyService.approveAttendance(this.selectedAttendance._id, false).subscribe({
      next: () => {
        this.selectedAttendance.approved = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Rejected',
          detail: 'Attendance rejected'
        });
        this.approvalDialog = false;
      }
    });
  }
  openApprovalCompoffDialog(attendance: any) {
    this.selectedAttendance = attendance;
    this.approvalDialog = true;
  }
}
