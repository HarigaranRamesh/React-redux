import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { PayloadService } from '../services/payload/payload.service';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, CalendarModule],
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent implements OnInit {
  selectedMonth: Date | null = null;
  loading = false;

  constructor(private payloadService: PayloadService) {}

  ngOnInit(): void {}

  /**
   * ✅ Trigger backend PDF generation & auto-download
   */
  generatePayslip() {
    if (!this.selectedMonth) {
      alert('Please select a month.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User not logged in — userId not found.');
      return;
    }

    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth() + 1; // 1-based

    this.loading = true;

    this.payloadService.downloadPayslip(userId, year, month).subscribe({
      next: (blob) => {
        this.loading = false;
        const fileURL = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `Payslip_${year}_${month}.pdf`;
        a.click();
        window.URL.revokeObjectURL(fileURL);
      },
      error: (err) => {
        console.error('Error downloading payslip:', err);
        alert('Failed to generate payslip. Please try again.');
        this.loading = false;
      }
    });
  }
}
