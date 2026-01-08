import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ApplyLeaveComponent } from './apply-leave.component';
import { AttendanceService } from '../services/attendance/attendance.service';

describe('ApplyLeaveComponent', () => {
  let component: ApplyLeaveComponent;
  let fixture: ComponentFixture<ApplyLeaveComponent>;

  let attendanceServiceSpy: jasmine.SpyObj<AttendanceService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const aSpy = jasmine.createSpyObj('AttendanceService', ['getMonthHolidays', 'checkHoliday', 'applyLeave']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ApplyLeaveComponent, HttpClientModule, ReactiveFormsModule],
      providers: [
        { provide: AttendanceService, useValue: aSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    attendanceServiceSpy = TestBed.inject(AttendanceService) as jasmine.SpyObj<AttendanceService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(ApplyLeaveComponent);
    component = fixture.componentInstance;

    // Mock default returns
    attendanceServiceSpy.getMonthHolidays.and.returnValue(of({ dates: [] }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load month holidays on init', () => {
    expect(attendanceServiceSpy.getMonthHolidays).toHaveBeenCalled();
  });

  it('should validate form before submission', () => {
    component.submitLeaveRequest();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
    expect(attendanceServiceSpy.applyLeave).not.toHaveBeenCalled();
  });

  it('should submit valid leave request', () => {
    component.leaveForm.patchValue({
      leaveType: 'Sick Leave',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-02'),
      reason: 'Feeling unwell'
    });

    attendanceServiceSpy.applyLeave.and.returnValue(of({ success: true }));

    component.submitLeaveRequest();

    expect(attendanceServiceSpy.applyLeave).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
