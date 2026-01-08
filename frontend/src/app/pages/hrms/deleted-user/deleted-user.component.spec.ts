import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { DeletedUserComponent } from './deleted-user.component';
import { UserService } from '../services/user/user.service';

describe('DeletedUserComponent', () => {
  let component: DeletedUserComponent;
  let fixture: ComponentFixture<DeletedUserComponent>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    const uSpy = jasmine.createSpyObj('UserService', ['getDeletedUsers', 'restoreUser']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);
    const cSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [DeletedUserComponent, HttpClientModule],
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

    fixture = TestBed.createComponent(DeletedUserComponent);
    component = fixture.componentInstance;

    // Mock default returns
    userServiceSpy.getDeletedUsers.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load deleted users on init', () => {
    expect(userServiceSpy.getDeletedUsers).toHaveBeenCalled();
  });

  it('should confirm restore', () => {
    const user = { _id: '123', user_name: 'John' };
    component.confirmRestore(user);
    expect(confirmationServiceSpy.confirm).toHaveBeenCalled();
    expect(component.selectedUser).toBe(user);
  });

  it('should restore user', () => {
    const user = { _id: '123', user_name: 'John' };
    component.selectedUser = user;
    component.deletedUsers = [user];

    userServiceSpy.restoreUser.and.returnValue(of({}));

    component.restoreUser();

    expect(userServiceSpy.restoreUser).toHaveBeenCalledWith('123');
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(component.deletedUsers.length).toBe(0);
  });
});
