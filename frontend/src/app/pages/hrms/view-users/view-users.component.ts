import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { UserService } from '../services/user/user.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-view-users',
  imports: [CommonModule,TableModule,FormsModule,DropdownModule,InputTextModule],
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.scss'
})
export class ViewUsersComponent implements OnInit {
  userList: any[] = [];
  total: number = 0;
  limit: number = 10;
  loading = false;

  filterOptions = [
    { label: 'User Name', value: 'user_name' },
    { label: 'Mobile No', value: 'mobile_no' },
    { label: 'Email', value: 'email' }
  ];
  selectedField: any = 'user_name'; // default
  searchText: string = '';

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers({ first: 0, rows: this.limit, page: 0 });
  }

  loadUsers(event: any) {
    this.loading = true;

    const page = event.page + 1;
    const limit = event.rows;

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (this.searchText && this.selectedField) {
      params = params.set(this.selectedField.value, this.searchText);
    }

    this.http
      .get<any>(`${environment.apiUrl}/api/user`, { params })
      .subscribe({
        next: (res) => {
          this.userList = res.data;
          this.total = res.total;
          this.limit = res.limit;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }
}
