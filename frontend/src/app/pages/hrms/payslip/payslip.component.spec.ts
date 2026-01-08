import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { PayslipComponent } from './payslip.component';
import { PayloadService } from '../services/payload/payload.service';

describe('PayslipComponent', () => {
  let component: PayslipComponent;
  let fixture: ComponentFixture<PayslipComponent>;

  let payloadServiceSpy: jasmine.SpyObj<PayloadService>;

  beforeEach(async () => {
    const pSpy = jasmine.createSpyObj('PayloadService', ['downloadPayslip']);

    await TestBed.configureTestingModule({
      imports: [PayslipComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: PayloadService, useValue: pSpy }
      ]
    })
      .compileComponents();

    payloadServiceSpy = TestBed.inject(PayloadService) as jasmine.SpyObj<PayloadService>;

    fixture = TestBed.createComponent(PayslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate payslip', () => {
    localStorage.setItem('userId', '123');
    component.selectedMonth = new Date('2023-01-01');

    payloadServiceSpy.downloadPayslip.and.returnValue(of(new Blob()));

    // Mock window.URL.createObjectURL and revokeObjectURL
    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
    spyOn(window.URL, 'revokeObjectURL');

    // Mock document.createElement and click
    const anchor = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(anchor);
    spyOn(anchor, 'click');

    component.generatePayslip();

    expect(payloadServiceSpy.downloadPayslip).toHaveBeenCalledWith('123', 2023, 1);
    expect(anchor.click).toHaveBeenCalled();
  });

  it('should alert if month not selected', () => {
    spyOn(window, 'alert');
    component.selectedMonth = null;
    component.generatePayslip();
    expect(window.alert).toHaveBeenCalledWith('Please select a month.');
  });
});
