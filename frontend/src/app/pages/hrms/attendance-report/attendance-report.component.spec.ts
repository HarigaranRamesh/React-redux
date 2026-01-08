import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { AttendanceReportComponent } from './attendance-report.component';
import { AttendanceService } from '../services/attendance/attendance.service';

describe('AttendanceReportComponent', () => {
  let component: AttendanceReportComponent;
  let fixture: ComponentFixture<AttendanceReportComponent>;

  let attendanceServiceSpy: jasmine.SpyObj<AttendanceService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const aSpy = jasmine.createSpyObj('AttendanceService', ['getMyAttendance']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [AttendanceReportComponent, HttpClientModule, ReactiveFormsModule],
      providers: [
        { provide: AttendanceService, useValue: aSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    attendanceServiceSpy = TestBed.inject(AttendanceService) as jasmine.SpyObj<AttendanceService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(AttendanceReportComponent);
    component = fixture.componentInstance;

    // Mock default returns
    attendanceServiceSpy.getMyAttendance.and.returnValue(of({ data: [] }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load daily attendance on init', () => {
    localStorage.setItem('userId', '123');
    component.getDailyAttendance();
    expect(attendanceServiceSpy.getMyAttendance).toHaveBeenCalledWith('123');
  });

  it('should handle missing userId', () => {
    localStorage.removeItem('userId');
    component.getDailyAttendance();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
  });
});
