import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';
import { AppMenuPanel } from "./app.menupanel";

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, AppMenuPanel],
    template: ` <div class="layout-sidebar">
        <!-- <app-menu></app-menu> -->
        <app-menu-panel></app-menu-panel>
    </div>`
})
export class AppSidebar {
    constructor(public el: ElementRef) {}
}
