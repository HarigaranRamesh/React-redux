import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* PrimeNG */
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LeavePoliciesService, Policy } from '../services/leavepolicy/leave-policies.service';

/* Service */

@Component({
  selector: 'app-leave-policy-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DropdownModule,
    TableModule,
    InputNumberModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
  ],
  templateUrl: './leave-policy-admin.component.html',
  styleUrls: ['./leave-policy-admin.component.scss'],
  providers: [MessageService],
})
export class LeavePolicyAdminComponent implements OnInit {
  // roles come from leave policy collection (distinct)
  policyRoles: string[] = [];
  selectedRoleName = '';

  // existing policies for selected role
  policies: Policy[] = [];

  // multiple new rows staged before saving
  newRows: Policy[] = [];

  // form options
  labels: Policy['label'][] = [
    'Sick Leave',
    'Casual Leave',
    'Planned Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Compoff Leave',
  ];
  accrualTypes: Policy['accrualType'][] = ['monthly', 'annual', 'fixed'];

  // add role inline
  newRoleName = '';

  constructor(
    private leavePoliciesService: LeavePoliciesService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPolicyRoles();
  }

  // Load distinct roles from LeavePolicy
  loadPolicyRoles() {
    this.leavePoliciesService.getRoles().subscribe({
      next: (res) => {
        this.policyRoles = (res || []).sort((a, b) => a.localeCompare(b));
      },
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load policy roles' }),
    });
  }

  // When a role is selected, load its policies
  onRoleChange() {
    if (!this.selectedRoleName) {
      this.policies = [];
      this.newRows = [];
      return;
    }
    this.leavePoliciesService.getPolicies(this.selectedRoleName).subscribe({
      next: (res) => {
        this.policies = res || [];
        this.newRows = [];
      },
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load policies' }),
    });
  }

  // Add a new role locally (becomes real once policies are saved)
  addRole() {
    const role = (this.newRoleName || '').trim();
    if (!role) return;

    const exists = this.policyRoles.find((r) => r.toLowerCase() === role.toLowerCase());
    if (!exists) {
      this.policyRoles = [...this.policyRoles, role].sort((a, b) => a.localeCompare(b));
    }
    this.selectedRoleName = exists || role;
    this.policies = [];
    this.newRows = [];
    this.newRoleName = '';
  }

  // ----- New policies (multi-add) -----
  addNewRow() {
    if (!this.selectedRoleName) return;
    this.newRows.push({
      role: this.selectedRoleName,
      label: 'Sick Leave',
      amount: 1,
      accrualType: 'monthly',
    });
  }

  removeNewRow(i: number) {
    this.newRows.splice(i, 1);
  }

  saveAllNew() {
    if (!this.newRows.length) return;

    let done = 0, failed = 0;

    const next = () => {
      const row = this.newRows.shift();
      if (!row) {
        this.toast.add({
          severity: failed ? 'warn' : 'success',
          summary: 'Save complete',
          detail: `Added ${done}, failed ${failed}`,
        });
        this.onRoleChange(); // refresh policies table
        this.loadPolicyRoles(); // refresh distinct roles (in case this was a brand-new role)
        return;
      }
      const body = {
        role: row.role,
        label: row.label,
        amount: Number(row.amount),
        accrualType: row.accrualType,
      };
      this.leavePoliciesService.createPolicy(body).subscribe({
        next: () => {
          done++;
          next();
        },
        error: () => {
          failed++;
          next();
        },
      });
    };

    next();
  }

  // ----- Existing policies -----
  saveExisting(row: Policy) {
    if (!row._id) return;
    const body: Partial<Policy> = {
      role: row.role,
      label: row.label,
      amount: Number(row.amount),
      accrualType: row.accrualType,
    };
    this.leavePoliciesService.updatePolicy(row._id, body).subscribe({
      next: (res) => {
        // update local row
        const idx = this.policies.findIndex((p) => p._id === row._id);
        if (idx >= 0 && res?.data) this.policies[idx] = res.data;
        this.policies = [...this.policies];
        this.toast.add({ severity: 'success', summary: 'Saved', detail: 'Policy updated' });
      },
      error: (e) => {
        const msg = e?.error?.message || 'Update failed';
        this.toast.add({ severity: 'error', summary: 'Error', detail: msg });
      },
    });
  }

  deletePolicy(row: Policy) {
    if (!row._id) return;
    this.leavePoliciesService.deletePolicy(row._id).subscribe({
      next: () => {
        this.policies = this.policies.filter((p) => p._id !== row._id);
        this.toast.add({ severity: 'success', summary: 'Deleted', detail: 'Policy removed' });
      },
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' }),
    });
  }
}
