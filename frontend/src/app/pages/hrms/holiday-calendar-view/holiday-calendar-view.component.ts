import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { HolidayService, HolidayRule } from '../services/holiday/holiday.service';

type HolidayOcc = { id?: string; name: string; color?: string; isRule: boolean; isGovernment?: boolean; };
type DayCell = { date: Date; inMonth: boolean; key: string; isToday: boolean; holidays: HolidayOcc[]; };

@Component({
  selector: 'app-holiday-calendar-view',
  standalone: true,
  imports: [CommonModule, HttpClientModule, TooltipModule, ToastModule, ButtonModule],
  templateUrl: './holiday-calendar-view.component.html',
  styleUrls: ['./holiday-calendar-view.component.scss'],
  providers: [MessageService]
})
export class HolidayCalendarViewComponent implements OnInit {
  constructor(private http: HttpClient, private holidayService: HolidayService, private toast: MessageService) {}

  readonly now = new Date();
  month = signal<number>(this.now.getMonth());
  year  = signal<number>(this.now.getFullYear());

  rules = signal<HolidayRule[]>([]);

  weekLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  grid = computed<DayCell[]>(() => this.buildMonthGrid(this.year(), this.month(), this.rules()));

  ngOnInit(): void {
    this.fetchRules();
  }

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
          this.pushOcc(map, this.toISO(d), { id:(r.id||r._id), name:r.name, color:r.color, isRule:false });
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
            if (date) this.pushOcc(map, this.toISO(date), { id:(r.id||r._id), name:r.name, color:r.color, isRule:true });
          }
        }
      } else if (kind === 'weekly') {
        const wds = r.recurrence.weekdays ?? [];
        const dim = new Date(year, month + 1, 0).getDate();
        for (let d = 1; d <= dim; d++) {
          const dt = new Date(year, month, d);
          if (wds.indexOf(dt.getDay()) !== -1) {
            this.pushOcc(map, this.toISO(dt), { id:(r.id||r._id), name:r.name, color:r.color, isRule:true });
          }
        }
      } else if (kind === 'annual-fixed') {
        const base = r.recurrence.startDate;
        if (base) {
          const mm = +base.slice(0,2), dd = +base.slice(3,5);
          if (mm - 1 === month) {
            const dt = new Date(year, month, dd);
            this.pushOcc(map, this.toISO(dt), { id:(r.id||r._id), name:r.name, color:r.color, isRule:true });
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

  private toISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }

  private sameDate(a: Date, b: Date): boolean {
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }

  monthName(m: number) { return new Date(2000, m, 1).toLocaleString(undefined, { month: 'long' }); }
}
