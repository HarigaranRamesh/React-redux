import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../services/attendance/attendance.service';
import * as XLSX from 'xlsx';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-monthlyreport',
  standalone: true,
  imports: [CommonModule, TableModule, DropdownModule, FormsModule,ButtonModule],
  templateUrl: './monthlyreport.component.html',
  styleUrls: ['./monthlyreport.component.scss']
})
export class MonthlyreportComponent implements OnInit {
  cols: string[] = [];
  attendanceData: any[] = [];
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;

  monthOptions = [
    { label: 'January', value: 1 }, { label: 'February', value: 2 },
    { label: 'March', value: 3 }, { label: 'April', value: 4 },
    { label: 'May', value: 5 }, { label: 'June', value: 6 },
    { label: 'July', value: 7 }, { label: 'August', value: 8 },
    { label: 'September', value: 9 }, { label: 'October', value: 10 },
    { label: 'November', value: 11 }, { label: 'December', value: 12 }
  ];

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.loadPivotReport();
  }

  loadPivotReport() {
    this.attendanceService.getMonthlyPivot(this.year, this.month).subscribe({
      next: (res) => {
        if (res.success) {
          this.cols = ['_totals', 'user_name', ...res.dates];
          this.attendanceData = Object.keys(res.users).map(user => ({
            user_name: user,
            ...res.users[user]
          }));
        }
      },
      error: (err) => console.error('Pivot load error', err)
    });
  }

  onMonthChange() {
    this.loadPivotReport();
  }

  getCellClass(value: string | null): string {
    if (!value) return 'cell-null';
    switch (value.toLowerCase()) {
      case 'present': return 'cell-present';
      case 'absent': return 'cell-absent';
      case 'holiday': return 'cell-holiday';
      case 'loading': return 'cell-loading';
      default: return 'cell-default';
    }
  }

  // ✅ Export as CSV
  exportCSV() {
    const rows = this.attendanceData.map(row => {
      const r: any = {};
      this.cols.forEach(col => r[col] = row[col] || '');
      return r;
    });

    const csvContent = [
      this.cols.join(','),
      ...rows.map(r => this.cols.map(c => `"${r[c]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${this.year}_${this.month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ✅ Export as Excel
  exportExcel() {
    const rows = this.attendanceData.map(row => {
      const r: any = {};
      this.cols.forEach(col => r[col] = row[col] || '');
      return r;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `attendance_${this.year}_${this.month}.xlsx`);
  }
}
