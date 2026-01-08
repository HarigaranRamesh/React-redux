import { Component, HostListener, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../pages/hrms/services/login/login.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [
        DialogModule,
        CalendarModule,
        TieredMenuModule,
        PanelMenuModule,
        ButtonModule,
        FormsModule,
        RouterModule,
        CommonModule,
        StyleClassModule,
        AppConfigurator
    ],
    template: `
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/home">
              <span>OA -HRMS</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <div class="flex flex-column text-left line-height-1">
                    <span class="font-medium text-sm">{{ userName || 'Guest' }}</span>
                    <small class="text-xs text-color-secondary">{{ userRole || 'User' }}</small>
                </div>
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content flex align-items-center gap-3">
                    <!-- ✅ Show TieredMenu for Desktop -->
                    <ng-container *ngIf="!isMobile">
                        <p-tieredMenu #profileMenu [model]="profileItems" [popup]="true"></p-tieredMenu>
                        <button type="button" class="layout-topbar-action flex align-items-center gap-2" (click)="profileMenu.toggle($event)">
                            <i class="pi pi-user text-lg"></i>
                        </button>
                    </ng-container>

                    <!-- ✅ Show PanelMenu for Mobile -->
                    <ng-container *ngIf="isMobile">
                        <button type="button" class="layout-topbar-action flex align-items-center gap-2" (click)="toggleMobileMenu()">
                            <i class="pi pi-user text-lg"></i>
                        </button>
                        <div *ngIf="showMobileMenu" class="mobile-panel-menu">
                            <p-panelMenu [model]="profileItems" [style]="{'width':'200px'}"></p-panelMenu>
                        </div>
                    </ng-container>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: [`
        .mobile-panel-menu {
            position: absolute;
            top: 60px;
            right: 10px;
            background: var(--surface-overlay);
            padding: 0.5rem;
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            z-index: 999;
        }
    `]
})
export class AppTopbar implements OnInit {
    userName: string | null;
    userRole: string | null;
    isMobile: boolean = false;
    showMobileMenu: boolean = false;

    constructor(public layoutService: LayoutService, private loginServices: LoginService, private router: Router) {
        this.userName = localStorage.getItem('user_name');
        this.userRole = localStorage.getItem('position');
    }

    ngOnInit() {
        this.checkScreenSize();
    }

    @HostListener('window:resize', [])
    onResize() {
        this.checkScreenSize();
    }

    checkScreenSize() {
        this.isMobile = window.innerWidth <= 991;
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    toggleMobileMenu() {
        this.showMobileMenu = !this.showMobileMenu;
    }

    profileItems: MenuItem[] = [
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => {}
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                this.router.navigate(['/login'], { replaceUrl: true });
            }
        }
    ];
}
