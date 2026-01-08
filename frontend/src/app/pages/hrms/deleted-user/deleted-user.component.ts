import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../services/user/user.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-deleted-user',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ConfirmDialogModule, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './deleted-user.component.html',
  styleUrls: ['./deleted-user.component.scss']
})
export class DeletedUserComponent implements OnInit {
  deletedUsers: any[] = [];
  loading = false;
  selectedUser: any;
  environment = environment;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadDeletedUsers();
  }

  loadDeletedUsers(): void {
    this.loading = true;
    this.userService.getDeletedUsers().subscribe({
      next: (res) => {
        this.deletedUsers = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Unable to load deleted users'
        });
      }
    });
  }

  confirmRestore(user: any): void {
    this.selectedUser = user;
    this.confirmationService.confirm({
      message: `Are you sure you want to restore ${user.user_name}?`,
      header: 'Confirm Restore',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      accept: () => this.restoreUser(),
    });
  }

  restoreUser(): void {
    if (!this.selectedUser?._id) return;
    this.userService.restoreUser(this.selectedUser._id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'User Restored',
          detail: `${this.selectedUser.user_name} restored successfully`
        });
        this.deletedUsers = this.deletedUsers.filter(u => u._id !== this.selectedUser._id);
        this.selectedUser = null;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Restore Failed',
          detail: err.error?.message || 'An error occurred while restoring'
        });
      }
    });
  }
}
