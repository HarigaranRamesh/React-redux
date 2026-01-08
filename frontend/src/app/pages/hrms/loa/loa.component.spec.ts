import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { LoaComponent } from './loa.component';
import { UserService } from '../services/user/user.service';
import { PayloadService } from '../services/payload/payload.service';

describe('LoaComponent', () => {
  let component: LoaComponent;
  let fixture: ComponentFixture<LoaComponent>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let payloadServiceSpy: jasmine.SpyObj<PayloadService>;

  beforeEach(async () => {
    const uSpy = jasmine.createSpyObj('UserService', ['getUserById']);
    const pSpy = jasmine.createSpyObj('PayloadService', ['getPayloadsByUser']);

    await TestBed.configureTestingModule({
      imports: [LoaComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: UserService, useValue: uSpy },
        { provide: PayloadService, useValue: pSpy }
      ]
    })
      .compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    payloadServiceSpy = TestBed.inject(PayloadService) as jasmine.SpyObj<PayloadService>;

    fixture = TestBed.createComponent(LoaComponent);
    component = fixture.componentInstance;

    // Mock default returns
    userServiceSpy.getUserById.and.returnValue(of({}));
    payloadServiceSpy.getPayloadsByUser.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data on init', () => {
    localStorage.setItem('userId', '123');
    component.ngOnInit();
    expect(userServiceSpy.getUserById).toHaveBeenCalledWith('123');
  });

  it('should load salary structure', () => {
    const payload = {
      ctc: 1200000,
      basic: { enabled: true, percent: 50 },
      hra: { enabled: true, percent: 20 },
      pf: { enabled: true, percent: 12 }
    };
    payloadServiceSpy.getPayloadsByUser.and.returnValue(of([payload]));

    component.loadSalaryStructure();

    expect(component.monthlyCTC).toBe(1200000);
    expect(component.salaryTable.length).toBeGreaterThan(0);
  });
});
