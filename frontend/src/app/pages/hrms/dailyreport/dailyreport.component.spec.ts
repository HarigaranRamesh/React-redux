import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { DailyreportComponent } from './dailyreport.component';
import { AttendanceService } from '../services/attendance/attendance.service';

describe('DailyreportComponent', () => {
  let component: DailyreportComponent;
  let fixture: ComponentFixture<DailyreportComponent>;

  let attendanceServiceSpy: jasmine.SpyObj<AttendanceService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const aSpy = jasmine.createSpyObj('AttendanceService', ['getDailyReport', 'approveAttendance']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [DailyreportComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: AttendanceService, useValue: aSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    attendanceServiceSpy = TestBed.inject(AttendanceService) as jasmine.SpyObj<AttendanceService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(DailyreportComponent);
    component = fixture.componentInstance;

    // Mock default returns
    attendanceServiceSpy.getDailyReport.and.returnValue(of({ data: [], total: 0 }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load attendance on init', () => {
    expect(attendanceServiceSpy.getDailyReport).toHaveBeenCalled();
  });

  it('should approve attendance', () => {
    component.selectedAttendance = { _id: '123' };
    attendanceServiceSpy.approveAttendance.and.returnValue(of({}));

    component.approveAttendance();

    expect(attendanceServiceSpy.approveAttendance).toHaveBeenCalledWith('123', true);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should reject attendance', () => {
    component.selectedAttendance = { _id: '123' };
    attendanceServiceSpy.approveAttendance.and.returnValue(of({}));

    component.rejectAttendance();

    expect(attendanceServiceSpy.approveAttendance).toHaveBeenCalledWith('123', false);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
  });
});
