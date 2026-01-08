import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { DailyAttendanceReportComponent } from './daily-attendance-report.component';
import { DailyAttendanceService } from '../services/reports/daily-attendance.service';

describe('DailyAttendanceReportComponent', () => {
  let component: DailyAttendanceReportComponent;
  let fixture: ComponentFixture<DailyAttendanceReportComponent>;

  let dailyServiceSpy: jasmine.SpyObj<DailyAttendanceService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const dSpy = jasmine.createSpyObj('DailyAttendanceService', ['getDayReport', 'appendDayReport', 'getPersistedMonthlyReport', 'overridePresent', 'approveAttendance']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [DailyAttendanceReportComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: DailyAttendanceService, useValue: dSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    dailyServiceSpy = TestBed.inject(DailyAttendanceService) as jasmine.SpyObj<DailyAttendanceService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(DailyAttendanceReportComponent);
    component = fixture.componentInstance;

    // Mock default returns
    dailyServiceSpy.getDayReport.and.returnValue(of({ data: [], total: 0 }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load live report on init', () => {
    expect(dailyServiceSpy.getDayReport).toHaveBeenCalled();
  });

  it('should append report', () => {
    dailyServiceSpy.appendDayReport.and.returnValue(of({ data: [], total: 0, mode: 'append' }));
    component.appendReport();
    expect(dailyServiceSpy.appendDayReport).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should mark as present', () => {
    component.selectedAttendance = { _id: '123' };
    dailyServiceSpy.overridePresent.and.returnValue(of({ data: { _id: '123', status: 'Present' } }));

    component.markAsPresent();

    expect(dailyServiceSpy.overridePresent).toHaveBeenCalledWith('123', jasmine.any(String));
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
