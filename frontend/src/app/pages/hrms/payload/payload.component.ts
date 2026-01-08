import { Component, Input, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { PayloadService } from '../services/payload/payload.service';

type RowType = 'allowance' | 'deduction' | 'employer' | 'total';

@Component({
  selector: 'app-payload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    FloatLabelModule,
    ToastModule,
    TableModule
  ],
  providers: [MessageService],
  templateUrl: './payload.component.html',
  styleUrls: ['./payload.component.scss']
})
export class PayloadComponent implements OnInit {
  @Input() empId: any = '';
  @Input() isEditMode = false;
  @Input() payloadData: any = null;

  userForm!: FormGroup;

  totalPercent = 0;
  showPreview = false;

  salaryBreakdown: any[] = [];
  netSalarySummary: any | null = null;

  currentUserId = '678b163cbffdb207e1d7c848';

  allowanceItems = [
    { key: 'basic', label: 'Basic Salary' },
    { key: 'hra', label: 'House Rent Allowance (HRA)' },
    { key: 'da', label: 'Dearness Allowance (DA)' },
    { key: 'ta', label: 'Travel Allowance (TA)' },
    { key: 'conveyance', label: 'Conveyance Allowance' },
    { key: 'medical', label: 'Medical Reimbursement' },
    { key: 'special', label: 'Special Allowance' }
  ];

  constructor(
    private payloadService: PayloadService,
    private messageService: MessageService
  ) { }

  // --------------------------------------------------
  // INIT
  // --------------------------------------------------
  ngOnInit(): void {
    this.userForm = new FormGroup({
      user_id: new FormControl({ value: this.empId, disabled: true }),

      ctc: new FormControl('', [Validators.required, Validators.min(0)]),

      basicEnabled: new FormControl(false),
      basicPercent: new FormControl(0),
      hraEnabled: new FormControl(false),
      hraPercent: new FormControl(0),
      daEnabled: new FormControl(false),
      daPercent: new FormControl(0),
      taEnabled: new FormControl(false),
      taPercent: new FormControl(0),
      conveyanceEnabled: new FormControl(false),
      conveyancePercent: new FormControl(0),
      medicalEnabled: new FormControl(false),
      medicalPercent: new FormControl(0),
      specialEnabled: new FormControl(false),
      specialPercent: new FormControl(0),

      pfEnabled: new FormControl(false),

      ptEnabled: new FormControl(false),
      ptPercent: new FormControl(0),
      tdsEnabled: new FormControl(false),
      tdsPercent: new FormControl(0),

      esicEmployerEnabled: new FormControl(false),
      esicEmployeeEnabled: new FormControl(false),

      createdMonth: new FormControl('', Validators.required),
      untilMonth: new FormControl('', Validators.required)
    });

    this.userForm.valueChanges.subscribe(() => this.calculateTotalPercent());

    if (this.isEditMode && this.payloadData) {
      this.patchFormWithData(this.payloadData);
    } else {
      this.calculateTotalPercent();
    }
  }

  patchFormWithData(data: any) {
    this.userForm.patchValue({
      ctc: data.ctc,
      basicEnabled: data.basic?.enabled,
      basicPercent: data.basic?.percent,
      hraEnabled: data.hra?.enabled,
      hraPercent: data.hra?.percent,
      daEnabled: data.da?.enabled,
      daPercent: data.da?.percent,
      taEnabled: data.ta?.enabled,
      taPercent: data.ta?.percent,
      conveyanceEnabled: data.conveyance?.enabled,
      conveyancePercent: data.conveyance?.percent,
      medicalEnabled: data.medical?.enabled,
      medicalPercent: data.medical?.percent,
      specialEnabled: data.special?.enabled,
      specialPercent: data.special?.percent,
      pfEnabled: data.pf?.enabled,
      ptEnabled: data.pt?.enabled,
      ptPercent: data.pt?.percent,
      tdsEnabled: data.tds?.enabled,
      tdsPercent: data.tds?.percent,
      esicEmployerEnabled: data.esicEmployer?.enabled,
      esicEmployeeEnabled: data.esicEmployee?.enabled,
      createdMonth: data.createdMonth,
      untilMonth: data.untilMonth
    });
    this.calculateTotalPercent();
  }

  // --------------------------------------------------
  // ALLOWANCE % TOTAL
  // --------------------------------------------------
  calculateTotalPercent(): void {
    const v = this.userForm.getRawValue();
    const keys = ['basic', 'hra', 'da', 'ta', 'conveyance', 'medical', 'special'];

    this.totalPercent = 0;
    keys.forEach((k) => {
      if (v[`${k}Enabled`]) {
        this.totalPercent += Number(v[`${k}Percent`] || 0);
      }
    });
  }

  // --------------------------------------------------
  // PREVIEW
  // --------------------------------------------------
  onCalculatePreview(): void {
    if (!this.userForm.get('ctc')?.value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please enter CTC.'
      });
      return;
    }

    if (this.totalPercent !== 100) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Allowance percentage must total 100%.'
      });
      return;
    }

    const payroll = this.calculatePayslipFrontend(this.userForm.getRawValue());

    // Build rows with percent + annual
    const pct = payroll.pct || {};
    const rows: Array<{
      component: string;
      percent: number | null;
      monthly: number;
      annual: number;
      type: RowType;
    }> = [];

    const pushRow = (component: string, percent: number | null, monthly: number, type: RowType) => {
      rows.push({
        component,
        percent,
        monthly: Number(monthly || 0),
        annual: Number((monthly || 0) * 12),
        type
      });
    };

    // Allowances
    pushRow('Basic Salary', pct.basic ?? null, payroll.basic, 'allowance');
    pushRow('HRA', pct.hra ?? 0, payroll.hra, 'allowance');
    pushRow('DA', pct.da ?? 0, payroll.da, 'allowance');
    pushRow('TA', pct.ta ?? 0, payroll.ta, 'allowance');
    pushRow('Conveyance', pct.conveyance ?? 0, payroll.conveyance, 'allowance');
    pushRow('Medical', pct.medical ?? 0, payroll.medical, 'allowance');
    pushRow('Special', pct.special ?? 0, payroll.special, 'allowance');

    // Totals + Deductions
    pushRow('Gross Salary', null, payroll.gross, 'total');
    pushRow('Employee PF', null, payroll.employeePf, 'deduction');
    pushRow('Employee ESIC', null, payroll.employeeEsic, 'deduction');

    const totalEmployeeDeductions = (payroll.employeePf || 0) + (payroll.employeeEsic || 0);
    pushRow('Net Salary (Take-home)', null, payroll.netSalary, 'total');

    // Employer contributions (optional)
    pushRow('Employer PF', null, payroll.employerPf, 'employer');
    pushRow('Employer ESIC', null, payroll.employerEsic, 'employer');

    this.salaryBreakdown = rows;

    // Summary
    this.netSalarySummary = {
      configuredCtc: payroll.configuredCtc,
      gross: payroll.gross,
      employeePf: payroll.employeePf,
      employeeEsic: payroll.employeeEsic,
      totalEmployeeDeductions: Number(totalEmployeeDeductions.toFixed(2)),
      netSalary: payroll.netSalary,
      employerPf: payroll.employerPf,
      employerEsic: payroll.employerEsic,
      computedEmployerCost: payroll.computedEmployerCost
    };

    this.showPreview = true;
  }

  // --------------------------------------------------
  // CORE PAYROLL LOGIC (BACKEND EQUIVALENT)
  // --------------------------------------------------
  calculatePayslipFrontend(emp: any) {
    const fx = (n: number) => Number((n || 0).toFixed(2));
    const ctc = Number(emp.ctc || 0);

    const keys = ['basic', 'hra', 'da', 'ta', 'conveyance', 'medical', 'special'];
    const enabled = keys.filter((k) => emp[`${k}Enabled`]);

    // Basic >= 40 rule
    let basicInput = emp.basicEnabled ? Number(emp.basicPercent) : 40;
    if (basicInput < 40) basicInput = 40;

    const others = enabled.filter((k) => k !== 'basic');
    const sumOthers = others.reduce((s, k) => s + Number(emp[`${k}Percent`] || 0), 0);

    // Normalize percentages so total = 100 with basic fixed at >=40
    const pct: any = {};
    pct.basic = basicInput;

    others.forEach((k) => {
      pct[k] =
        sumOthers > 0
          ? (Number(emp[`${k}Percent`] || 0) / sumOthers) * (100 - pct.basic)
          : 0;
    });

    // TEMP GROSS ITERATION
    let gross = ctc;
    let prev = 0;

    for (let i = 0; i < 50 && Math.abs(gross - prev) > 1; i++) {
      prev = gross;

      const basicTemp = gross * (pct.basic / 100);
      const empPfTemp = emp.pfEnabled
        ? basicTemp > 15000
          ? 1800
          : basicTemp * 0.12
        : 0;

      const empEsicTemp = emp.esicEmployeeEnabled && gross < 21000 ? gross * 0.0075 : 0;

      const pt = emp.ptEnabled ? ctc * (Number(emp.ptPercent || 0) / 100) : 0;
      const tds = emp.tdsEnabled ? ctc * (Number(emp.tdsPercent || 0) / 100) : 0;

      gross = ctc - (empPfTemp + empEsicTemp + pt + tds);
    }

    const basicTemp = gross * (pct.basic / 100);

    const employerPf = emp.pfEnabled
      ? basicTemp > 15000
        ? 1800
        : basicTemp * 0.12
      : 0;

    const employerEsic = emp.esicEmployerEnabled && gross < 21000 ? gross * 0.0325 : 0;

    const grossFinal = ctc - (employerPf + employerEsic);
    const basicFinal = grossFinal * (pct.basic / 100);

    const employeePf = emp.pfEnabled
      ? basicFinal > 15000
        ? 1800
        : basicFinal * 0.12
      : 0;

    const employeeEsic =
      emp.esicEmployeeEnabled && grossFinal < 21000 ? grossFinal * 0.0075 : 0;

    const netSalary = grossFinal - (employeePf + employeeEsic);

    return {
      pct, // ✅ percent map for UI

      basic: fx(basicFinal),
      hra: fx((grossFinal * (pct.hra || 0)) / 100),
      da: fx((grossFinal * (pct.da || 0)) / 100),
      ta: fx((grossFinal * (pct.ta || 0)) / 100),
      conveyance: fx((grossFinal * (pct.conveyance || 0)) / 100),
      medical: fx((grossFinal * (pct.medical || 0)) / 100),
      special: fx((grossFinal * (pct.special || 0)) / 100),

      gross: fx(grossFinal),
      netSalary: fx(netSalary),

      employeePf: fx(employeePf),
      employeeEsic: fx(employeeEsic),
      employerPf: fx(employerPf),
      employerEsic: fx(employerEsic),

      configuredCtc: fx(ctc),
      computedEmployerCost: fx(
        grossFinal + employeePf + employeeEsic + employerPf + employerEsic
      )
    };
  }

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  onSubmit(): void {
    if (this.userForm.invalid || this.totalPercent !== 100) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Fix form errors before saving.'
      });
      return;
    }

    const v = this.userForm.getRawValue();

    const payload = {
      user_id: this.empId,
      ctc: Number(v.ctc),

      basic: { enabled: !!v.basicEnabled, percent: Number(v.basicPercent || 0) },
      hra: { enabled: !!v.hraEnabled, percent: Number(v.hraPercent || 0) },
      da: { enabled: !!v.daEnabled, percent: Number(v.daPercent || 0) },
      ta: { enabled: !!v.taEnabled, percent: Number(v.taPercent || 0) },
      conveyance: { enabled: !!v.conveyanceEnabled, percent: Number(v.conveyancePercent || 0) },
      medical: { enabled: !!v.medicalEnabled, percent: Number(v.medicalPercent || 0) },
      special: { enabled: !!v.specialEnabled, percent: Number(v.specialPercent || 0) },

      pf: { enabled: !!v.pfEnabled },

      pt: { enabled: !!v.ptEnabled, percent: Number(v.ptPercent || 0) },
      tds: { enabled: !!v.tdsEnabled, percent: Number(v.tdsPercent || 0) },

      esicEmployer: { enabled: !!v.esicEmployerEnabled },
      esicEmployee: { enabled: !!v.esicEmployeeEnabled },

      createdMonth: v.createdMonth,
      untilMonth: v.untilMonth,

      totalAllowancePercent: this.totalPercent,
      createdBy: this.currentUserId,
      status: true
    };

    if (this.isEditMode) {
      this.payloadService.updatePayload(this.payloadData._id, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Salary structure updated.'
          });
          this.showPreview = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to update salary structure.'
          });
        }
      });
    } else {
      this.payloadService.createPayload(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Saved',
            detail: 'Salary structure saved.'
          });
          this.userForm.reset();
          this.totalPercent = 0;
          this.showPreview = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || 'Failed to save salary structure.'
          });
        }
      });
    }
  }
}
