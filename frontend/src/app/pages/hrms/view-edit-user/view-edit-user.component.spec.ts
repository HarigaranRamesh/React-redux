import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ViewEditUserComponent } from './view-edit-user.component';
import { UserService } from '../services/user/user.service';

describe('ViewEditUserComponent', () => {
  let component: ViewEditUserComponent;
  let fixture: ComponentFixture<ViewEditUserComponent>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const uSpy = jasmine.createSpyObj('UserService', ['deleteUser', 'getUserDocsByUserId']);
    const hSpy = jasmine.createSpyObj('HttpClient', ['get', 'put']);

    await TestBed.configureTestingModule({
      imports: [ViewEditUserComponent, HttpClientModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: UserService, useValue: uSpy },
        { provide: HttpClient, useValue: hSpy }
      ]
    })
      .compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    fixture = TestBed.createComponent(ViewEditUserComponent);
    component = fixture.componentInstance;

    // Mock default returns
    httpSpy.get.and.returnValue(of({ data: [], total: 0 }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(httpSpy.get).toHaveBeenCalled();
  });

  it('should open edit dialog and patch form', () => {
    const user = {
      user_name: 'Test User',
      email: 'test@example.com',
      role: 'Employee'
    };
    component.openEditDialog(user);
    expect(component.showDialog).toBeTrue();
    expect(component.editForm.get('user_name')?.value).toBe('Test User');
  });

  it('should save edited user', () => {
    component.selectedUser = { _id: '123' };
    component.editForm.patchValue({
      user_name: 'Updated User',
      mobile_no: '1234567890',
      email: 'test@example.com',
      position: 'Dev',
      role: 'Employee',
      policyName: 'Default',
      doj: new Date()
    });

    httpSpy.put.and.returnValue(of({}));

    component.saveEditedUser();

    expect(httpSpy.put).toHaveBeenCalled();
    expect(component.showDialog).toBeFalse();
  });

  it('should delete user', () => {
    const user = { _id: '123', user_name: 'Test' };
    spyOn(window, 'prompt').and.returnValue('Reason');
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    userServiceSpy.deleteUser.and.returnValue(of({}));

    component.confirmDelete(user);

    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith('123', jasmine.any(String), 'Reason');
  });
});
