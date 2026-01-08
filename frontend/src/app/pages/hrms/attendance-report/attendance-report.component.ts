import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.scss',
  providers:[MessageService]
})
export class AttendanceReportComponent implements OnInit {
  dailyAttendance: any[] = [];

  constructor(
    private fb: FormBuilder,
    private attendanceService: AttendanceService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getDailyAttendance();
  }

  getDailyAttendance() {
    const id = localStorage.getItem('userId') || '';
    if (!id) {
      this.messageService.add({ severity: 'warn', summary: 'Missing ID', detail: 'User ID not found' });
      return;
    }

    this.attendanceService.getMyAttendance(id).subscribe({
      next: (res: any) => {
        this.dailyAttendance = res?.data || [];
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load attendance' });
      }
    });
  }
}
