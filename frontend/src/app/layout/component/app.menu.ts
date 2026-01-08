import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { LoginService } from '../../pages/hrms/services/login/login.service';
// import { LoginService } from '../../pages/donar-app/services/login.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
    <ul class="layout-menu">
      <ng-container *ngFor="let item of model; let i = index">
        <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul>
  `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(private loginService: LoginService) { }

    ngOnInit() {
        this.buildMenuFromToken();
    }



    buildMenuFromToken() {
        const token = this.loginService.getToken();
        if (!token) return;

        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const access = decoded.access || [];

            this.model = access.map((menu: any) => ({
                label: menu.menuName,
                items: (menu.children || []).map((child: any) => ({
                    label: child.submenuName,
                    icon: 'pi pi-fw pi-angle-right', // you can customize per menu
                    routerLink: this.mapRoute(child.submenuName)
                }))
            }));
        } catch (err) {
            console.error('Error decoding token:', err);
        }
    }

    mapRoute(submenuName: string): string {
        // Custom mapping between submenuName and route paths
        const routeMap: Record<string, string> = {
            'Dashboard': '/',
            'Add User': '/home/adduser',
            'View Users': '/home/viewuser',
            'Daily Report': '/home/dailyreport',
            'Monthly Report': '/home/monthlyreport',
            'Leave Request': '/home/leaverequest',
            'E-Dashboard': '/e-dashboard',
            'Petrol Reimbursment': '/home/petrolreimbursment',
            'Attendance': '/home/attendance',
            'Employee Leave Approval': '/home/leaveapproval',
            'Employee Petrol Approval': '/home/petrolapproval',
            'access/': '/home/access',
            'Access': '/home/access',
            'Access Define': 'home/accessdefine',
            'Access2': '/home/access2',
            'Id-card':'/home/idcard',
            'Feed': '/home/feed',
            'Users Leave Policy Edit':'/home/userleaveedit'




            // Add more as needed
        };

        return routeMap[submenuName] || '/notfound';
    }
}
