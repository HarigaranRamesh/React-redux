import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { DropdownModule } from 'primeng/dropdown';
import { PickListModule } from 'primeng/picklist';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccessdefineService } from '../services/access/accessdefine.service';

type RoleOption = { _id: string; role: string };
type Submenu = { submenuName: string };
type Menu = { menuName: string; children: Submenu[] };

@Component({
  selector: 'app-accessdefine',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    PickListModule,
    InputTextModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './accessdefine.component.html',
  styleUrls: ['./accessdefine.component.scss'],
  providers: [MessageService]
})
export class AccessdefineComponent implements OnInit {
  roles: RoleOption[] = [];
  selectedRoleId: string | null = null;

  menusSource: Menu[] = [];
  menusTarget: Menu[] = [];

  selectedMenuIndex: number | null = null;
  childSource: Submenu[] = [];
  childTarget: Submenu[] = [];

  newMenuName = '';
  newChildName = '';
  private stdMenuCatalog: Menu[] = [];

  constructor(
    private accessService: AccessdefineService,
    private toast: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.accessService.getRoles().subscribe({
      next: (res) => (this.roles = res || []),
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' })
    });
  }

  onRoleChange() {
    this.selectedMenuIndex = null;
    this.childSource = [];
    this.childTarget = [];

    if (!this.selectedRoleId) {
      this.menusSource = [];
      this.menusTarget = [];
      this.stdMenuCatalog = [];
      return;
    }

    const roleName = this.roles.find(r => r._id === this.selectedRoleId)?.role || '';
    const stdRole = (roleName === 'Employee' || roleName === 'Intern') ? roleName : 'Admin';

    forkJoin({
      current: this.accessService.getRoleMain(this.selectedRoleId),
      standard: this.accessService.getStandardMenu(stdRole)
    }).subscribe({
      next: ({ current, standard }) => {
        const currentMain = Array.isArray(current?.main) ? current.main : [];
        const stdMain = Array.isArray(standard?.main) ? standard.main : [];

        this.stdMenuCatalog = this.deepClone(stdMain);
        this.menusTarget = this.deepClone(currentMain);

        const currentNames = new Set(currentMain.map(m => m.menuName));
        this.menusSource = this.deepClone(stdMain.filter(m => !currentNames.has(m.menuName)));

        this.selectedMenuIndex = this.menusTarget.length ? 0 : null;
        this.refreshChildLists();
      },
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load role menu' })
    });
  }

  private findCatalogForMenu(menuName: string): Submenu[] {
    const fromStd = this.stdMenuCatalog.find(m => m.menuName === menuName)?.children || [];
    const fromSource = this.menusSource.find(m => m.menuName === menuName)?.children || [];
    const fromTarget = this.menusTarget.find(m => m.menuName === menuName)?.children || [];
    const all = [...fromStd, ...fromSource, ...fromTarget];
    const uniq = new Set(all.map(x => x.submenuName));
    return Array.from(uniq).map(x => ({ submenuName: x }));
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  onTargetMenuClick(index: number) {
    this.selectedMenuIndex = index;
    this.refreshChildLists();
  }

  private refreshChildLists() {
    if (
      this.selectedMenuIndex == null ||
      this.selectedMenuIndex < 0 ||
      this.selectedMenuIndex >= this.menusTarget.length
    ) {
      this.childSource = [];
      this.childTarget = [];
      return;
    }
    const selMenu = this.menusTarget[this.selectedMenuIndex];
    const catalogForMenu = this.findCatalogForMenu(selMenu.menuName);
    const existingNames = new Set((selMenu.children || []).map(c => c.submenuName));
    this.childTarget = this.deepClone(selMenu.children || []);
    this.childSource = this.deepClone(catalogForMenu.filter(c => !existingNames.has(c.submenuName)));
  }

  onMenusMove() {
    if (this.selectedMenuIndex != null && this.selectedMenuIndex >= this.menusTarget.length) {
      this.selectedMenuIndex = this.menusTarget.length ? this.menusTarget.length - 1 : null;
    }
    this.refreshChildLists();
  }

  onChildrenMove() {
    if (this.selectedMenuIndex == null) return;
    this.menusTarget[this.selectedMenuIndex].children = this.deepClone(this.childTarget);
  }

  addMenu() {
    const name = (this.newMenuName || '').trim();
    if (!name) return;
    if (this.menusTarget.some(m => m.menuName.toLowerCase() === name.toLowerCase())) {
      this.toast.add({ severity: 'warn', summary: 'Exists', detail: 'Menu already in selection' });
      return;
    }
    this.menusSource = this.menusSource.filter(m => m.menuName.toLowerCase() !== name.toLowerCase());
    this.menusTarget.push({ menuName: name, children: [] });
    this.newMenuName = '';
    this.onTargetMenuClick(this.menusTarget.length - 1);
  }

  addChild() {
    if (this.selectedMenuIndex == null) return;
    const name = (this.newChildName || '').trim();
    if (!name) return;
    const tgt = this.menusTarget[this.selectedMenuIndex];
    if (tgt.children.some(c => c.submenuName.toLowerCase() === name.toLowerCase())) {
      this.toast.add({ severity: 'warn', summary: 'Exists', detail: 'Submenu already in selection' });
      return;
    }
    this.childSource = this.childSource.filter(c => c.submenuName.toLowerCase() !== name.toLowerCase());
    this.childTarget = [...this.childTarget, { submenuName: name }];
    this.newChildName = '';
    this.onChildrenMove();
  }

  saveMain() {
    if (!this.selectedRoleId) return;
    const cleanMain: Menu[] = this.menusTarget.map(m => ({
      menuName: m.menuName,
      children: (m.children || []).map(c => ({ submenuName: c.submenuName }))
    }));
    this.accessService.saveRoleMain(this.selectedRoleId, cleanMain).subscribe({
      next: () =>
        this.toast.add({ severity: 'success', summary: 'Saved', detail: 'Role main updated' }),
      error: () =>
        this.toast.add({ severity: 'error', summary: 'Error', detail: 'Save failed' })
    });
  }

  roleLabelById(id: string | null): string {
    if (!id) return '';
    const r = this.roles.find(x => x._id === id);
    return r ? r.role : id;
  }
}
