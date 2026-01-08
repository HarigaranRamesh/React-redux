import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

import { PetrolService } from '../services/petrol/petrol.service';

@Component({
  selector: 'app-petrol-approval',
  standalone: true,
  templateUrl: './petrol-approval.component.html',
  styleUrls: ['./petrol-approval.component.scss'],
  providers: [MessageService],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    ToastModule,
    FormsModule,
    TabViewModule,
    InputTextModule
  ]
})
export class PetrolApprovalComponent implements OnInit {
  // Bulk (top table)
  bulkClaims: any[] = [];
  bulkTotal = 0;
  bulkLimit = 10;
  bulkPage = 1;
  bulkSearchText = '';
  bulkLoading = false;

  // Remarks (single approval inside expanded rows)
  displayRemarksDialog = false;
  selectedClaimId = '';
  remarks = '';
  actionType: 'approve' | 'reject' = 'approve';

  constructor(
    private petrolService: PetrolService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getBulkPetrolCredits({ page: 0, rows: this.bulkLimit });
  }

  /** Normalize PrimeNG pagination event to 1-based page & rows */
  private getPage1AndLimit(event: any, currentLimit: number) {
    const rows = event?.rows ?? currentLimit ?? 10;
    const page0 = (event?.page != null)
      ? event.page
      : (event?.first != null ? Math.floor(event.first / rows) : 0);
    return { page1: page0 + 1, rows };
  }

  // -------- Bulk + Single (inline) --------
  getBulkPetrolCredits(event: any) {
    this.bulkLoading = true;
    const { page1, rows } = this.getPage1AndLimit(event, this.bulkLimit);
    this.bulkPage = page1;
    this.bulkLimit = rows;

    this.petrolService.getBulkPetrolCredits(this.bulkPage, this.bulkLimit, this.bulkSearchText).subscribe({
      next: (res: any) => {
        this.bulkClaims = res.data || [];
        this.bulkTotal = res.total || 0;
        this.bulkLoading = false;
      },
      error: () => { this.bulkLoading = false; }
    });
  }

  onSearchBulk(dtBulk: any) {
    dtBulk.reset();
    this.getBulkPetrolCredits({ first: 0, rows: this.bulkLimit });
  }

  toggleExpand(user: any) {
    user.expanded = !user.expanded;
  }

  openRemarksDialog(claimId: string, action: 'approve' | 'reject') {
    this.selectedClaimId = claimId;
    this.actionType = action;
    this.remarks = '';
    this.displayRemarksDialog = true;
  }

  submitAction() {
    const approveBy = localStorage.getItem('userId') || '';
    const payload = { approveBy, remarks: this.remarks || '', approved: this.actionType === 'approve' };

    this.petrolService.approveClaim(this.selectedClaimId, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Claim ${this.actionType}d successfully`
        });
        this.displayRemarksDialog = false;
        this.getBulkPetrolCredits({ page: this.bulkPage - 1, rows: this.bulkLimit });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.actionType} claim`
        });
      }
    });
  }

  approveAllClaims(user: any) {
    const approveBy = localStorage.getItem('userId') || '';
    const userId = typeof user === 'object' ? (user.userId || user._id) : user;

    this.petrolService.approveAllClaims(userId, { approveBy, remarks: this.remarks || 'Bulk Approved' }).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message || 'Bulk approval done' });
        this.getBulkPetrolCredits({ page: this.bulkPage - 1, rows: this.bulkLimit });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Bulk approval failed' });
      }
    });
  }
}
