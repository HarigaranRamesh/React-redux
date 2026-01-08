import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { UserService } from '../services/user/user.service';
import { PayloadService } from '../services/payload/payload.service';

@Component({
  selector: 'app-loa',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './loa.component.html',
  styleUrls: ['./loa.component.scss']
})
export class LoaComponent implements OnInit {
  @ViewChild('letterContainer', { static: false }) letterContainer!: ElementRef;
  today = new Date();

  company = {
    name: 'ONEASSIST TECHNOLOGIES LLP',
    address: `553, NVN Layout, Ponnai Street, Tatabad, Gandhipuram, Coimbatore - 641012`,
    contact: '+91 95974 31719',
    email: 'info@oneassist.net',
    website: 'https://oneassistech.com',
    logo: 'logo.jpg',
    sign: 'sign.jpg',
    hr: 'NIRMAL CHANDRAN',
    hrTitle: 'Head – Finance & Operations'
  };

  user: any = {};
  salaryTable: any[] = [];
  totalCTC = 0;
  monthlyCTC = 0;
  totalEarnings = 0;
  totalDeductions = 0;
  netPay = 0;

  constructor(
    private userService: UserService,
    private payloadService: PayloadService
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    // 🧩 Fetch user info
    this.userService.getUserById(userId).subscribe({
      next: (data) => {
        this.user = data;
        this.loadSalaryStructure();
      },
      error: (err) => console.error('User fetch error:', err)
    });
  }

  loadSalaryStructure() {
    this.payloadService.getPayloadsByUser().subscribe({
      next: (payloads) => {
        if (!payloads || payloads.length === 0) return;
        const p = payloads[0];
        const ctc = Number(p.ctc || 0);
        this.monthlyCTC = ctc;
        this.totalCTC = ctc * 12;

        // Earnings components
        const earningsList = [
          { key: 'basic', label: 'Basic' },
          { key: 'hra', label: 'HRA' },
          { key: 'da', label: 'Dearness Allowance (DA)' },
          { key: 'ta', label: 'Travel Allowance (TA)' },
          { key: 'conveyance', label: 'Conveyance Allowance' },
          { key: 'medical', label: 'Medical Reimbursement' },
          { key: 'special', label: 'Special Allowance' }
        ];

        // Deduction components
        const deductionsList = [
          { key: 'pf', label: 'Provident Fund (PF)' },
          { key: 'pt', label: 'Professional Tax (PT)' },
          { key: 'tds', label: 'Tax Deducted at Source (TDS)' }
        ];

        const earnings: any[] = [];
        const deductions: any[] = [];

        // Earnings calculation
        earningsList.forEach((c) => {
          if (p[c.key]?.enabled && p[c.key]?.percent) {
            const percent = p[c.key].percent;
            const monthly = (ctc * percent) / 100;
            earnings.push({
              component: c.label,
              monthly,
              annual: monthly * 12
            });
          }
        });

        // Deductions calculation
        deductionsList.forEach((c) => {
          if (p[c.key]?.enabled && p[c.key]?.percent) {
            const percent = p[c.key].percent;
            const monthly = (ctc * percent) / 100;
            deductions.push({
              component: c.label,
              monthly,
              annual: monthly * 12
            });
          }
        });

        // Totals
        this.totalEarnings = earnings.reduce((sum, e) => sum + e.monthly, 0);
        this.totalDeductions = deductions.reduce((sum, d) => sum + d.monthly, 0);
        this.netPay = this.totalEarnings - this.totalDeductions;

        // Final salary table
        this.salaryTable = [
          ...earnings,
          { component: 'Total Earnings', monthly: this.totalEarnings, annual: this.totalEarnings * 12 },
          ...deductions,
          { component: 'Total Deductions', monthly: this.totalDeductions, annual: this.totalDeductions * 12 },
          { component: 'Net Pay (Take Home)', monthly: this.netPay, annual: this.netPay * 12 },
          { component: 'Total (CTC)', monthly: ctc, annual: ctc * 12 }
        ];
      },
      error: (err) => console.error('Payload fetch error:', err)
    });
  }

  // 📄 Generate PDF
  async downloadPDF() {
    const container = this.letterContainer?.nativeElement;
    if (!container) return;

    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Provisional_Offer_${this.user.user_name || 'Employee'}.pdf`);
  }
}
