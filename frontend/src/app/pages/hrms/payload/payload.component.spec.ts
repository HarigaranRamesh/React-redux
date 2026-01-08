import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { PayloadComponent } from './payload.component';
import { PayloadService } from '../services/payload/payload.service';

describe('PayloadComponent', () => {
  let component: PayloadComponent;
  let fixture: ComponentFixture<PayloadComponent>;

  let payloadServiceSpy: jasmine.SpyObj<PayloadService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const pSpy = jasmine.createSpyObj('PayloadService', ['createPayload']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [PayloadComponent, HttpClientModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: PayloadService, useValue: pSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    payloadServiceSpy = TestBed.inject(PayloadService) as jasmine.SpyObj<PayloadService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(PayloadComponent);
    component = fixture.componentInstance;
    component.empId = '123';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total percent', () => {
    component.userForm.patchValue({
      basicEnabled: true,
      basicPercent: 50,
      hraEnabled: true,
      hraPercent: 20
    });

    component.calculateTotalPercent();
    expect(component.totalPercent).toBe(70);
  });

  it('should calculate preview', () => {
    component.userForm.patchValue({
      ctc: 1200000,
      basicEnabled: true,
      basicPercent: 50,
      hraEnabled: true,
      hraPercent: 50 // Total 100%
    });

    component.onCalculatePreview();

    expect(component.showPreview).toBeTrue();
    expect(component.salaryBreakdown.length).toBeGreaterThan(0);
  });

  it('should submit payload', () => {
    component.userForm.patchValue({
      ctc: 1200000,
      basicEnabled: true,
      basicPercent: 50,
      hraEnabled: true,
      hraPercent: 50, // Total 100%
      createdMonth: '2023-01',
      untilMonth: '2023-12'
    });

    payloadServiceSpy.createPayload.and.returnValue(of({}));

    component.onSubmit();

    expect(payloadServiceSpy.createPayload).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
