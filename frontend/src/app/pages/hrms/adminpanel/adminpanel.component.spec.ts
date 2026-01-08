import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { AdminpanelComponent } from './adminpanel.component';
import { UserService } from '../services/user/user.service';

describe('AdminpanelComponent', () => {
  let component: AdminpanelComponent;
  let fixture: ComponentFixture<AdminpanelComponent>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const uSpy = jasmine.createSpyObj('UserService', [
      'getDashboardStats', 'getProfile', 'getPetrolBalance', 'getLeaveTiles',
      'checkAttendance', 'loginAttendance', 'logoutAttendance', 'changePassword'
    ]);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [AdminpanelComponent, HttpClientModule, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: uSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(AdminpanelComponent);
    component = fixture.componentInstance;

    // Mock default returns
    userServiceSpy.getDashboardStats.and.returnValue(of({ totalEmployees: 10 }));
    userServiceSpy.getProfile.and.returnValue(of({ availableLeaves: 5 }));
    userServiceSpy.getPetrolBalance.and.returnValue(of({ totalAmount: 100 }));
    userServiceSpy.getLeaveTiles.and.returnValue(of([]));
    userServiceSpy.checkAttendance.and.returnValue(of({ message: true }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard stats if admin', () => {
    component.isAdminOrSuperAdmin = true;
    component.loadDashboardStats();
    expect(userServiceSpy.getDashboardStats).toHaveBeenCalled();
    expect(component.totalEmployees).toBe(10);
  });

  it('should load profile if not admin', () => {
    component.isAdminOrSuperAdmin = false;
    localStorage.setItem('userId', '123');
    component.loadProfile();
    expect(userServiceSpy.getProfile).toHaveBeenCalled();
  });
});
