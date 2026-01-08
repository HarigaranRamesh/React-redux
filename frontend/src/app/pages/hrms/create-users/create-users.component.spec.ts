import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { CreateUsersComponent } from './create-users.component';
import { UserService } from '../services/user/user.service';
import { AccessService } from '../services/access/access.service';

describe('CreateUsersComponent', () => {
  let component: CreateUsersComponent;
  let fixture: ComponentFixture<CreateUsersComponent>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let accessServiceSpy: jasmine.SpyObj<AccessService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const uSpy = jasmine.createSpyObj('UserService', ['createUser', 'uploadUserDocs']);
    const aSpy = jasmine.createSpyObj('AccessService', ['getLeavePoliciesByRolesStrings']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [CreateUsersComponent, HttpClientModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: UserService, useValue: uSpy },
        { provide: AccessService, useValue: aSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    accessServiceSpy = TestBed.inject(AccessService) as jasmine.SpyObj<AccessService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(CreateUsersComponent);
    component = fixture.componentInstance;

    // Mock default returns
    accessServiceSpy.getLeavePoliciesByRolesStrings.and.returnValue(of(['policy1', 'policy2']));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch leave policies on init', () => {
    expect(accessServiceSpy.getLeavePoliciesByRolesStrings).toHaveBeenCalled();
    expect(component.leavePolicies.length).toBe(2);
  });

  it('should submit user form successfully', () => {
    component.userForm.patchValue({
      user_name: 'John Doe',
      mobile_no: '1234567890',
      password: 'password',
      email: 'john@example.com',
      role: 'Employee',
      position: 'Developer',
      policyName: 'policy1',
      doj: new Date()
    });

    userServiceSpy.createUser.and.returnValue(of({ data: { _id: '123' } }));
    const nextStepSpy = jasmine.createSpy('nextStep');

    component.onSubmitUser(nextStepSpy);

    expect(userServiceSpy.createUser).toHaveBeenCalled();
    expect(component.empId).toBe('123');
    expect(nextStepSpy).toHaveBeenCalledWith(2);
  });

  it('should submit uploads successfully', () => {
    component.empId = '123';
    userServiceSpy.uploadUserDocs.and.returnValue(of({}));
    const nextStepSpy = jasmine.createSpy('nextStep');

    component.onSubmitUploads(nextStepSpy);

    expect(userServiceSpy.uploadUserDocs).toHaveBeenCalled();
    expect(nextStepSpy).toHaveBeenCalledWith(3);
  });
});
