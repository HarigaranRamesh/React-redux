import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { LoginService } from '../services/login/login.service';
import { LoaderService } from '../services/loader/loader.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const lSpy = jasmine.createSpyObj('LoginService', ['loginUser', 'saveToken']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);
    const loaderSpy = jasmine.createSpyObj('LoaderService', ['show', 'hide']); // Assuming methods

    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: LoginService, useValue: lSpy },
        { provide: Router, useValue: rSpy },
        { provide: MessageService, useValue: mSpy },
        { provide: LoaderService, useValue: loaderSpy }
      ]
    })
      .compileComponents();

    loginServiceSpy = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loginService on valid form submission', () => {
    const mockForm = {
      invalid: false,
      control: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') }
    } as any;

    const mockResponse = { token: 'abc', message: 'Success' };
    loginServiceSpy.loginUser.and.returnValue(of(mockResponse));

    // Set service properties as component reads from them in the code provided
    loginServiceSpy.username = 'testuser';
    loginServiceSpy.password = 'password';

    component.login(mockForm);

    expect(loginServiceSpy.loginUser).toHaveBeenCalledWith('testuser', 'password');
    expect(loginServiceSpy.saveToken).toHaveBeenCalledWith('abc');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle login failure', () => {
    const mockForm = {
      invalid: false,
      control: { markAllAsTouched: jasmine.createSpy('markAllAsTouched') }
    } as any;

    const mockError = { error: { message: 'Invalid credentials' } };
    loginServiceSpy.loginUser.and.returnValue(throwError(() => mockError));

    loginServiceSpy.username = 'testuser';
    loginServiceSpy.password = 'wrongpass';

    component.login(mockForm);

    expect(loginServiceSpy.loginUser).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });
});
