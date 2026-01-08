import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
import { LoginService } from '../../pages/hrms/services/login/login.service';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
    selector: 'app-menu-panel',
    standalone: true,
    imports: [CommonModule, PanelMenuModule],
    template: `
    <p-panelmenu  [model]="model" ></p-panelmenu>
  `,
    styles: [`
    :host ::ng-deep .p-tieredmenu {
      width: 100%;
    }
  `]
})
export class AppMenuPanel implements OnInit {
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
                icon: 'pi pi-fw pi-folder',
                items: (menu.children || []).map((child: any) => ({
                    label: child.submenuName,
                    icon: 'pi pi-fw pi-angle-right',
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
            'ViewEdit Users': '/home/viewedituser',
            'Daily Report': '/home/dailyreport',
            'Monthly Report': '/home/monthlyreport',
            'Leave Request': '/home/leaverequest',
            'E-Dashboard': '/e-dashboard',
            'Petrol Reimbursment': '/home/petrolreimbursment',
            'Attendance': '/home/attendance',
            'Employee Leave Approval': '/home/leaveapproval',
            'Employee Petrol Approval': '/home/petrolapproval',
            'Access': '/home/access',
            'Access2': '/home/access2',

            'Access Define': '/home/accessdefine',
            'Yearly Leave Policy': '/home/yearlyleavyplocy',
            'Holiday Planning': '/home/holidayplanning',
            'Letter of Appointment': '/home/loa',
            'Letters of Appointment': '/home/loas',
            'Payslip': '/home/payslip',
            'Id-card':'/home/idcard',
            'Feed': '/home/feed',
            'Users Leave Policy Edit':'/home/userleaveedit'
            // Add more as needed
        };
        return routeMap[submenuName] || '/notfound';
    }
}
