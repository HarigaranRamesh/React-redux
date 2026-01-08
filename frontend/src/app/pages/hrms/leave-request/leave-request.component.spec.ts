import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { LeaveRequestComponent } from './leave-request.component';
import { LeaveService } from '../services/leave/leave.service';

describe('LeaveRequestComponent', () => {
  let component: LeaveRequestComponent;
  let fixture: ComponentFixture<LeaveRequestComponent>;

  let leaveServiceSpy: jasmine.SpyObj<LeaveService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const lSpy = jasmine.createSpyObj('LeaveService', ['submitLeave', 'getMonthHolidays', 'checkHoliday']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [LeaveRequestComponent, HttpClientModule, ReactiveFormsModule],
      providers: [
        { provide: LeaveService, useValue: lSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    leaveServiceSpy = TestBed.inject(LeaveService) as jasmine.SpyObj<LeaveService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(LeaveRequestComponent);
    component = fixture.componentInstance;

    // Mock default returns
    leaveServiceSpy.getMonthHolidays.and.returnValue(of({ dates: [] }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load month holidays on init', () => {
    expect(leaveServiceSpy.getMonthHolidays).toHaveBeenCalled();
  });

  it('should validate form before submission', () => {
    component.submitLeaveRequest();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
    expect(leaveServiceSpy.submitLeave).not.toHaveBeenCalled();
  });

  it('should submit valid leave request', () => {
    component.leaveForm.patchValue({
      leaveType: 'Sick Leave',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-02'),
      reason: 'Feeling unwell'
    });

    leaveServiceSpy.submitLeave.and.returnValue(of({ success: true }));

    component.submitLeaveRequest();

    expect(leaveServiceSpy.submitLeave).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
