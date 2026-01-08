import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MonthlyAttendanceService } from '../pages/hrms/services/reports/monthly-attendance.service';
@Component({
  selector: 'app-monthly-attendance-report',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ToastModule],
  templateUrl: './monthly-attendance-report.component.html',
  styleUrls: ['./monthly-attendance-report.component.scss'],
  providers: [MessageService]
})
export class MonthlyAttendanceReportComponent implements OnInit {
  summaryList: any[] = [];
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1; // default current month
  loading = false;

  constructor(
    private monthlyService: MonthlyAttendanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary() {
    this.loading = true;
    this.monthlyService.getMonthlySummary(this.year, this.month).subscribe({
      next: (res) => {
        this.summaryList = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load summary' });
      }
    });
  }
}
