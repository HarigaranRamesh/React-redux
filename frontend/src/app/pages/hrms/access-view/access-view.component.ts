import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { CardModule } from 'primeng/card';
import { HttpClientModule } from '@angular/common/http';
import { AccessService } from '../services/access/access.service';

type BackendNode = {
  label: string;
  data: {
    userId: string;
    roleId: string;
    name: string;
    rolename: string;
    access: string[];
    photo?: string;
    users?: Array<{ name: string; userId: string }>;
  };
  expanded?: boolean;
  children?: BackendNode[];
};

@Component({
  selector: 'app-access-view',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TreeModule,
    OrganizationChartModule,
    CardModule
  ],
  templateUrl: './access-view.component.html',
  styleUrls: ['./access-view.component.scss']
})
export class AccessViewComponent implements OnInit {
  orgData: BackendNode[] = [];
  treeData: BackendNode[] = [];
  selectedNode: BackendNode | null = null;

  totalEmployees = 0;

  constructor(private accessService: AccessService) {}

  ngOnInit(): void {
    this.loadHierarchy();
  }

  private loadHierarchy(): void {
    this.accessService.getHierarchy().subscribe({
      next: ({ orgData, treeData }) => {
        this.orgData = orgData || [];
        this.treeData = treeData || [];

        // count employees
        let employees = 0;
        const countEmployees = (nodes: BackendNode[]) => {
          for (const n of nodes) {
            if (n.data?.rolename === 'Employee') employees++;
            if (n.children?.length) countEmployees(n.children);
          }
        };
        countEmployees(this.orgData);
        this.totalEmployees = employees;
      },
      error: (err) => {
        console.error('Failed to load hierarchy:', err);
        this.orgData = [];
        this.treeData = [];
      }
    });
  }

  getAvatarUrl(name?: string, photo?: string): string {
    if (photo) return photo;
    const safeName = encodeURIComponent(name || 'Unknown User');
    return `https://ui-avatars.com/api/?name=${safeName}&background=random&size=64&bold=true`;
  }
}
