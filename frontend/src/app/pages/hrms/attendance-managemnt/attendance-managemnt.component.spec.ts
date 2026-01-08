import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { AttendanceManagemntComponent } from './attendance-managemnt.component';
import { AttendanceService } from '../services/attendance/attendance.service';

describe('AttendanceManagemntComponent', () => {
  let component: AttendanceManagemntComponent;
  let fixture: ComponentFixture<AttendanceManagemntComponent>;

  let attendanceServiceSpy: jasmine.SpyObj<AttendanceService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const aSpy = jasmine.createSpyObj('AttendanceService', ['getLeaveRequests', 'getMonthHolidays', 'checkHoliday', 'applyLeave']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [AttendanceManagemntComponent, HttpClientModule, ReactiveFormsModule],
      providers: [
        { provide: AttendanceService, useValue: aSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    attendanceServiceSpy = TestBed.inject(AttendanceService) as jasmine.SpyObj<AttendanceService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(AttendanceManagemntComponent);
    component = fixture.componentInstance;

    // Mock default returns
    attendanceServiceSpy.getLeaveRequests.and.returnValue(of({ data: [] }));
    attendanceServiceSpy.getMonthHolidays.and.returnValue(of({ dates: [] }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load leave requests on init', () => {
    expect(attendanceServiceSpy.getLeaveRequests).toHaveBeenCalled();
  });

  it('should submit leave request', () => {
    component.leaveForm.patchValue({
      leaveType: 'Sick Leave',
      startDate: new Date(),
      endDate: new Date(),
      reason: 'Sick'
    });

    attendanceServiceSpy.applyLeave.and.returnValue(of({ message: 'Success' }));

    component.submitLeaveRequest();

    expect(attendanceServiceSpy.applyLeave).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
