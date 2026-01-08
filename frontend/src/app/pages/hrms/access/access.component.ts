import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeDragDropService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
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
  };
  expanded?: boolean;
  children?: BackendNode[];
  draggable?: boolean;
  droppable?: boolean;
};

@Component({
  selector: 'app-access',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    TreeModule,
    OrganizationChartModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './access.component.html',
  styleUrls: ['./access.component.scss'],
  providers: [TreeDragDropService]
})
export class AccessComponent implements OnInit {
  orgData: BackendNode[] = [];
  treeData: BackendNode[] = [];
  selectedNode: BackendNode | null = null;

  isAdminOrSuperAdmin = false;
  totalEmployees = 0;

  constructor(private accessService: AccessService) {}

  ngOnInit(): void {
    this.loadHierarchy();
  }

  private getViewerId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const [, payload] = token.split('.');
      const p = JSON.parse(atob(payload));
      return String(p.sub || p._id || p.id || p.userId || '');
    } catch {
      return null;
    }
  }

  private isRootData(d: any): boolean {
    return Array.isArray(d?.access) &&
           d.access.length === 1 &&
           String(d.access[0]) === String(d.roleId);
  }

  private findNode(nodes: BackendNode[], pred: (n: BackendNode) => boolean): BackendNode | null {
    for (const n of nodes) {
      if (pred(n)) return n;
      if (n.children?.length) {
        const hit = this.findNode(n.children, pred);
        if (hit) return hit;
      }
    }
    return null;
  }

  loadHierarchy(): void {
    const viewerId = this.getViewerId();
    this.accessService.getHierarchy(viewerId || undefined).subscribe({
      next: ({ orgData, treeData }) => {
        this.orgData = orgData || [];
        this.treeData = treeData || [];

        if (viewerId) {
          const me = this.findNode(this.orgData, n => n.data?.userId === viewerId);
          if (me) {
            this.isAdminOrSuperAdmin =
              this.isRootData(me.data) || (me.data.rolename || '').toLowerCase().includes('admin');
          }
        }

        // Count employees
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

  refreshTree(): void {
    this.loadHierarchy();
  }

  handleDrop(event: any): void {
    const dragged = event?.dragNode?.data as BackendNode['data'] | undefined;
    const droppedOn = event?.dropNode?.data as BackendNode['data'] | undefined;
    if (!dragged || !droppedOn) return;

    if (droppedOn.rolename === 'Employee') {
      console.warn('❌ Cannot drop under Employee.');
      this.loadHierarchy();
      return;
    }

    if (dragged.rolename === 'Employee' && this.isRootData(droppedOn)) {
      console.warn('❌ Cannot place Employee directly under a root node.');
      this.loadHierarchy();
      return;
    }

    if (this.isRootData(dragged)) {
      console.warn('❌ Root nodes cannot be moved.');
      this.loadHierarchy();
      return;
    }

    if (dragged.rolename === 'Employee') {
      this.accessService.assignMember(dragged.userId, droppedOn.roleId).subscribe({
        next: () => this.loadHierarchy(),
        error: () => this.loadHierarchy()
      });
    } else {
      this.accessService.updateRoleAccess(dragged.roleId, droppedOn.roleId).subscribe({
        next: () => this.loadHierarchy(),
        error: () => this.loadHierarchy()
      });
    }
  }

  getAvatarUrl(name?: string, photo?: string): string {
    if (photo) return photo;
    const safeName = encodeURIComponent(name || 'Unknown User');
    return `https://ui-avatars.com/api/?name=${safeName}&background=random&size=64&bold=true`;
  }
}
