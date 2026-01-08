import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';

/* PrimeNG */
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';


type HolidayOcc = { id?: string; name: string; color?: string; isRule: boolean; isGovernment?: boolean; };
type DayCell = { date: Date; inMonth: boolean; key: string; isToday: boolean; holidays: HolidayOcc[]; };
import { HolidayService, HolidayRule } from '../services/holiday/holiday.service';

@Component({
  selector: 'app-holiday-planner',
  standalone: true,
  imports: [
    CommonModule, HttpClientModule, ReactiveFormsModule, FormsModule,
    ButtonModule, DialogModule, CalendarModule, DropdownModule, MultiSelectModule,
    InputTextModule, ColorPickerModule, ToggleButtonModule, TagModule, CardModule,
    TooltipModule, ToastModule, DividerModule, TableModule
  ],
  templateUrl: './holiday-planner.component.html',
  styleUrls: ['./holiday-planner.component.scss'],
  providers: [MessageService]
})
export class HolidayPlannerComponent implements OnInit {

  constructor(private http: HttpClient,private holidayService: HolidayService, private fb: FormBuilder, private toast: MessageService) {}


  // ===== Auth header =====
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ 'Authorization': token ? `Bearer ${token}` : '' });
  }

  // ===== Role gate =====
  isSuperAdmin = (localStorage.getItem('userRole') || '') === 'Super Admin';

  // ===== Month state =====
  readonly now = new Date();
  month = signal<number>(this.now.getMonth());
  year  = signal<number>(this.now.getFullYear());

  // ===== Data =====
  rules = signal<HolidayRule[]>([]);
  selectedDateForQuickAdd: Date | null = null;

  // ===== Dialogs / Forms =====
  showAddSingle = false;
  addSingleForm!: FormGroup;

  showAddRecurring = false;
  addRecurringForm!: FormGroup;

  showAddMultiple = false;
  bulkForm!: FormGroup;

  showImportBulk = false;
  bulkFile: File | null = null;

  // UI state
  saving = false;

  // ===== Options =====
  weekLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  weekdayOptions = [
    { label: 'Sun', value: 0 }, { label: 'Mon', value: 1 }, { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 }, { label: 'Thu', value: 4 }, { label: 'Fri', value: 5 }, { label: 'Sat', value: 6 }
  ];
  nthOptions = [1,2,3,4,5];
  monthOptions: Array<{label: string; value: number}> = [];

  // ===== Calendar grid =====
  grid = computed<DayCell[]>(() => this.buildMonthGrid(this.year(), this.month(), this.rules()));

  // ===== Init =====
  ngOnInit(): void {
    // Single
    this.addSingleForm = this.fb.group({
      name: ['', Validators.required],
      date: [null, Validators.required],   // Date object from p-calendar
      color: ['00E5FF']                    // hex WITHOUT '#', we add it on save
    });

    // Recurring
    this.addRecurringForm = this.fb.group({
      name: ['', Validators.required],
      color: ['9B59B6'],                   // hex WITHOUT '#'
      nths: [[3,4], Validators.required],
      weekdays: [[6], Validators.required],
      months: [[/* set below */]]
    });

    // Multiple
    this.bulkForm = this.fb.group({
      rows: this.fb.array([])
    });


    this.rows.push(this.fb.group({
  name: ['', Validators.required],
  date: [null, Validators.required],
  color: ['10b981'],          // hex without '#'
  isGovernment: [false],
  isEnabled: [true]
}));


    // Month options
    this.monthOptions = Array.from({length:12}, (_,m) => ({label: this.monthName(m), value: m}));
    this.addRecurringForm.patchValue({ months: Array.from({length:12}, (_,m)=>m) });

    this.fetchRules();
  }

  // ===== API helpers =====
  private fetchRules() {
     this.holidayService.getRules().subscribe({
      next: (res) => {
        const list = (res || []).map(r => ({ ...r, id: (r as any)._id || r.id }));
        this.rules.set(list);
      },
      error: () => {
        this.rules.set([
          { id: 'demo-1', name: '3rd & 4th Saturday Off', color: '#22d3ee', isEnabled: true,
            recurrence: { kind:'nth-weekday-monthly', nths:[3,4], weekdays:[6] } }
        ]);
      }
    });
  }


  // ===== Single =====
  openAddSingle(date?: Date) {
    if (!this.isSuperAdmin) return;
    this.selectedDateForQuickAdd = date ?? null;
    this.addSingleForm.reset({
      name: '',
      date: date ?? null,
      color: '00E5FF'
    });
    this.showAddSingle = true;
  }

  saveSingle() {
    if (this.addSingleForm.invalid || this.saving) { this.addSingleForm.markAllAsTouched(); return; }
    this.saving = true;
    const v = this.addSingleForm.value as {name: string; date: Date; color: string};
    const hex = this.normalizeHex(v.color);
    const iso = this.toISO(v.date);
    const rule: HolidayRule = { name: v.name, color: '#'+hex, isEnabled: true, date: iso };

    this.holidayService.createRule(rule).subscribe({
      next: () => {
        this.toast.add({ severity:'success', summary:'Holiday Added', detail:`${v.name} on ${iso}` });
        this.showAddSingle = false;
        this.refreshAll();
        this.saving = false;
      },
      error: () => { this.saving = false; this.toast.add({ severity:'error', summary:'Error', detail:'Failed to add holiday' }); }
    });
  }

  // ===== Recurring =====
  openAddRecurring(prefill?: {nths?: number[], weekdays?: number[]}) {
    if (!this.isSuperAdmin) return;
    if (prefill) {
      this.addRecurringForm.patchValue({
        nths: prefill.nths ?? [3,4],
        weekdays: prefill.weekdays ?? [6]
      });
    }
    this.showAddRecurring = true;
  }

  saveRecurring() {
    if (this.addRecurringForm.invalid || this.saving) { this.addRecurringForm.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.addRecurringForm.value as {name: string; color: string; nths: number[]; weekdays: number[]; months: number[]};
    const hex = this.normalizeHex(val.color);
    const rule: HolidayRule = {
      name: val.name, color: '#'+hex, isEnabled: true,
      recurrence: { kind:'nth-weekday-monthly', nths: val.nths, weekdays: val.weekdays, months: val.months }
    };
    this.holidayService.createRule(rule).subscribe({
      next: () => {
        this.toast.add({ severity:'success', summary:'Rule Added', detail: val.name });
        this.showAddRecurring = false;
        this.refreshAll();
        this.saving = false;
      },
      error: () => { this.saving = false; this.toast.add({ severity:'error', summary:'Error', detail:'Failed to add rule' }); }
    });
  }

  // ===== Enable/Disable =====
  doToggleRule(rule: HolidayRule) {
    if (!this.isSuperAdmin || this.saving) return;
    const id = rule.id || rule._id; if (!id) return;

    const newVal = !rule.isEnabled;
    this.saving = true;
    this.holidayService.setEnabled(id, newVal).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: newVal ? 'Enabled' : 'Disabled', detail: rule.name });
        this.refreshAll();
        this.saving = false;
      },
      error: () => { this.saving = false; this.toast.add({ severity:'error', summary:'Error', detail:'Failed to update status' }); }
    });
  }

  // ===== Delete =====
  doDeleteRule(rule: HolidayRule) {
    if (!this.isSuperAdmin || this.saving) return;
    const id = rule.id || rule._id; if (!id) return;

    this.saving = true;
    this.holidayService.deleteRule(id).subscribe({
      next: () => {
        this.toast.add({ severity:'success', summary:'Deleted', detail: rule.name });
        this.refreshAll();
        this.saving = false;
      },
      error: () => { this.saving = false; this.toast.add({ severity:'error', summary:'Error', detail:'Failed to delete' }); }
    });
  }

  // ===== Add Multiple =====
  get rows(): FormArray { return this.bulkForm.get('rows') as FormArray; }

  openAddMultiple() {
    if (!this.isSuperAdmin) return;
    this.bulkForm.reset();
    while (this.rows.length) this.rows.removeAt(0);
    this.addRow(); this.addRow();
    this.showAddMultiple = true;
  }

  addRow() {
    this.rows.push(this.fb.group({
      name: ['', Validators.required],
      date: [null, Validators.required],     // Date object from p-calendar
      color: ['10b981'],                      // hex WITHOUT '#'
      isGovernment: [false],
      isEnabled: [true]
    }));
  }

  removeRow(i: number) { this.rows.removeAt(i); }

  saveMultiple() {
    if (this.rows.length === 0 || this.saving) return;
      console.log(this.rows);

    // Validate rows
    for (let i = 0; i < this.rows.length; i++) {
      const g = this.rows.at(i) as FormGroup;
      if (g.invalid) { g.markAllAsTouched(); this.toast.add({severity:'warn', summary:'Fill all required', detail:`Row ${i+1}`}); return; }
    }

    const payload: HolidayRule[] = this.rows.controls.map(c => {
      const v = c.value as any;
      const hex = this.normalizeHex(v.color);
      return {
        name: v.name,
        color: '#'+hex,
        isGovernment: !!v.isGovernment,
        isEnabled: v.isEnabled !== false,
        date: this.toISO(v.date) // convert Date → 'YYYY-MM-DD'
      };
    });

    this.saving = true;

    // Try bulk endpoint; fallback to sequential
    this.holidayService.createRulesBulk(payload).subscribe({
      next: () => {
        this.toast.add({ severity:'success', summary:'Added', detail:`${payload.length} holidays` });
        this.showAddMultiple = false;
        this.refreshAll();
        this.saving = false;
      },
      error: () => {
        let done = 0, errors = 0;
        payload.forEach(p => {
          this.holidayService.createRule(p).subscribe({
            next: () => { if (++done === payload.length) this.finishBulk(errors, payload.length); },
            error: () => { errors++; if (++done === payload.length) this.finishBulk(errors, payload.length); }
          });
        });
      }
    });
  }

  private finishBulk(errors: number, total: number) {
    this.toast.add({
      severity: errors ? 'warn' : 'success',
      summary: 'Bulk add finished',
      detail: errors ? `${errors}/${total} failed` : `${total} added`
    });
    this.showAddMultiple = false;
    this.refreshAll();
    this.saving = false;
  }

  // ===== Bulk Import (CSV/XLSX) =====
  openImportBulk() { if (!this.isSuperAdmin) return; this.bulkFile = null; this.showImportBulk = true; }
  onBulkFileChange(evt: any) { const f = evt?.target?.files?.[0] as File | undefined; this.bulkFile = f || null; }
  uploadBulk() {
    if (!this.bulkFile || this.saving) return;
    this.saving = true;
    this.holidayService.importBulkFile(this.bulkFile).subscribe({
      next: (res) => {
        this.toast.add({ severity:'success', summary:'Imported', detail:`${res?.inserted ?? 0} holidays added` });
        this.showImportBulk = false;
        this.refreshAll();
        this.saving = false;
      },
      error: () => { this.saving = false; this.toast.add({ severity:'error', summary:'Import failed', detail:'Check file format' }); }
    });
  }

  // ===== Templates (CSV + Excel) =====
  downloadCsvTemplate() {
    const header = ['name','date','color','isGovernment','isEnabled','kind','nths','weekdays','months','startDate'];
    const sample = [
      ['Republic Day','2026-01-26','#22c55e','true','true','','','','',''],
      ['3rd & 4th Saturday','','#a855f7','false','true','nth-weekday-monthly','3|4','6','','',''],
      ['Tamil New Year','','#22d3ee','false','true','annual-fixed','','','','04-14']
    ];
    const rows = [header, ...sample]
      .map(r => r.map(v => (v ?? '').toString().includes(',') ? `"${(v ?? '').toString().replace(/"/g,'""')}"` : (v ?? '').toString()).join(','))
      .join('\r\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'holiday_template.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async downloadExcelTemplate() {
    try {
      // Try dynamic import (ensure you `npm i xlsx --save`)
      const XLSX = (await import('xlsx')).default || (await import('xlsx'));
      const header = ['name','date','color','isGovernment','isEnabled','kind','nths','weekdays','months','startDate'];
      const sample = [
        ['Republic Day','2026-01-26','#22c55e','true','true','','','','',''],
        ['3rd & 4th Saturday','','#a855f7','false','true','nth-weekday-monthly','3|4','6','','',''],
        ['Tamil New Year','','#22d3ee','false','true','annual-fixed','','','','04-14']
      ];
      const ws = XLSX.utils.aoa_to_sheet([header, ...sample]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, 'holiday_template.xlsx');
    } catch {
      // Fallback to CSV if xlsx lib not present
      this.toast.add({severity:'warn', summary:'Using CSV', detail:'Install xlsx to export real Excel'});
      this.downloadCsvTemplate();
    }
  }

  // ===== Calendar mechanics =====
  prevMonth() { const m = this.month(), y = this.year(); this.month.set((m + 11) % 12); this.year.set(m === 0 ? y - 1 : y); }
  nextMonth() { const m = this.month(), y = this.year(); this.month.set((m + 1) % 12); this.year.set(m === 11 ? y + 1 : y); }

  private buildMonthGrid(year: number, month: number, rules: HolidayRule[]): DayCell[] {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const lead = startWeekday, total = lead + daysInMonth, rows = Math.ceil(total / 7) * 7;

    const occMap = this.occurrencesInMonth(year, month, rules);

    const cells: DayCell[] = [];
    for (let i = 0; i < rows; i++) {
      const dayNum = i - lead + 1;
      let d: Date; let inMonth = true;
      if (dayNum < 1) { d = new Date(year, month, 0 + dayNum); inMonth = false; }
      else if (dayNum > daysInMonth) { d = new Date(year, month + 1, dayNum - daysInMonth); inMonth = false; }
      else { d = new Date(year, month, dayNum); }

      const key = this.toISO(d);
      const isToday = this.sameDate(d, this.now);
      const holidays = occMap.get(key) ?? [];
      cells.push({ date: d, inMonth, key, isToday, holidays });
    }
    return cells;
  }

  private occurrencesInMonth(year: number, month: number, rules: HolidayRule[]): Map<string, HolidayOcc[]> {
    const map = new Map<string, HolidayOcc[]>();
    for (const r of rules) {
      if (!r || r.isEnabled === false) continue;

      if (r.date) {
        const d = new Date(r.date + 'T00:00:00');
        if (d.getFullYear() === year && d.getMonth() === month) {
          this.pushOcc(map, this.toISO(d), { id:(r.id||r._id), name:r.name, color:r.color, isRule:false, isGovernment:r.isGovernment });
        }
        continue;
      }

      if (!r.recurrence) continue;
      const kind = r.recurrence.kind;

      if (kind === 'nth-weekday-monthly') {
        const nths = r.recurrence.nths ?? [];
        const wds  = r.recurrence.weekdays ?? [];
        const months = r.recurrence.months ?? Array.from({length:12}, (_,m)=>m);
        if (months.indexOf(month) === -1) continue;

        for (const wd of wds) {
          for (const n of nths) {
            const date = this.nthWeekdayOfMonth(year, month, wd, n);
            if (date) this.pushOcc(map, this.toISO(date), { id:(r.id||r._id), name:r.name, color:r.color, isRule:true, isGovernment:r.isGovernment });
          }
        }
      } else if (kind === 'weekly') {
        const wds = r.recurrence.weekdays ?? [];
        const dim = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= dim; d++) {
          const dt = new Date(year, month, d);
          if (wds.indexOf(dt.getDay()) !== -1) {
            this.pushOcc(map, this.toISO(dt), { id:(r.id||r._id), name:r.name, color:r.color, isRule:true, isGovernment:r.isGovernment });
          }
        }
      } else if (kind === 'annual-fixed') {
        const base = r.recurrence.startDate; // 'MM-DD'
        if (base) {
          const mm = +base.slice(0,2), dd = +base.slice(3,5);
          if (mm - 1 === month) {
            const dt = new Date(year, month, dd);
            this.pushOcc(map, this.toISO(dt), { id:(r.id||r._id), name:r.name, color:r.color, isRule:true, isGovernment:r.isGovernment });
          }
        }
      }
    }
    return map;
  }

  private pushOcc(map: Map<string, HolidayOcc[]>, key: string, occ: HolidayOcc) {
    const arr = map.get(key) ?? [];
    arr.push(occ);
    map.set(key, arr);
  }

  private nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date | null {
    const first = new Date(year, month, 1);
    const firstW = first.getDay();
    const offset = (weekday - firstW + 7) % 7;
    const day = 1 + offset + (nth - 1) * 7;
    const dim = new Date(year, month + 1, 0).getDate();
    if (day > dim) return null;
    return new Date(year, month, day);
  }

  // ===== Utils =====
  toISO(d: Date | null): string {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
  sameDate(a: Date, b: Date): boolean {
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }
  monthName(m: number) { return new Date(2000, m, 1).toLocaleString(undefined, { month: 'long' }); }
  join(list?: Array<string | number>): string { return (list ?? []).join(', '); }
  weekdayListText(weekdays?: number[]): string {
    const arr = weekdays ?? []; const names: string[] = [];
    for (let i = 0; i < arr.length; i++) { const idx = arr[i]; const label = this.weekLabels[idx]; if (label) names.push(label); }
    return names.join(', ');
  }

  displayColor(val?: string): string {
    if (!val) return '#10b981';
    return val.startsWith('#') ? val : `#${val}`;
  }
  normalizeHex(val?: string): string {
    if (!val) return '10b981';
    return val.replace(/^#/, '').trim();
  }

  // Click day to prefill single add
  onDayClicked(cell: DayCell) { if (!this.isSuperAdmin || !cell.inMonth) return; this.openAddSingle(cell.date); }

  // Central refresh so calendar + table always update
  private refreshAll() { this.fetchRules(); }
}
