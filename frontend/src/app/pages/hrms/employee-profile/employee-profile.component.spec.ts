import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { EmployeeProfileComponent } from './employee-profile.component';
import { UserService } from '../services/user/user.service';

describe('EmployeeProfileComponent', () => {
  let component: EmployeeProfileComponent;
  let fixture: ComponentFixture<EmployeeProfileComponent>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    const uSpy = jasmine.createSpyObj('UserService', [
      'getProfile', 'getAttendanceSummary', 'getLeaveTiles',
      'getPetrolBalance', 'checkAttendance', 'loginAttendance', 'logoutAttendance', 'changePassword'
    ]);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);
    const cSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [EmployeeProfileComponent, HttpClientModule, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: uSpy },
        { provide: MessageService, useValue: mSpy },
        { provide: ConfirmationService, useValue: cSpy }
      ]
    })
      .compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    confirmationServiceSpy = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;

    fixture = TestBed.createComponent(EmployeeProfileComponent);
    component = fixture.componentInstance;

    // Mock default returns
    userServiceSpy.getProfile.and.returnValue(of({ _id: '123', user_name: 'John' }));
    userServiceSpy.getAttendanceSummary.and.returnValue(of({ presentDays: 10, absentDays: 2 }));
    userServiceSpy.getLeaveTiles.and.returnValue(of([]));
    userServiceSpy.getPetrolBalance.and.returnValue(of({ totalAmount: 100 }));
    userServiceSpy.checkAttendance.and.returnValue(of({ message: true }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile data on init', () => {
    expect(userServiceSpy.getProfile).toHaveBeenCalled();
    expect(component.profile()?.user_name).toBe('John');
  });

  it('should load attendance summary', () => {
    expect(userServiceSpy.getAttendanceSummary).toHaveBeenCalled();
    expect(component.attendance()?.presentDays).toBe(10);
  });

  it('should check clock status', () => {
    expect(userServiceSpy.checkAttendance).toHaveBeenCalled();
    expect(component.checkStatus).toBeTrue();
  });
});
