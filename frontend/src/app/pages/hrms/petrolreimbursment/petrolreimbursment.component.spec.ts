import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { PetrolReimbursmentComponent } from './petrolreimbursment.component';
import { PetrolReimbursmentService } from '../services/reimbursement/petrol-reimbursment.service';

describe('PetrolReimbursmentComponent', () => {
  let component: PetrolReimbursmentComponent;
  let fixture: ComponentFixture<PetrolReimbursmentComponent>;

  let petrolServiceSpy: jasmine.SpyObj<PetrolReimbursmentService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    const pSpy = jasmine.createSpyObj('PetrolReimbursmentService', ['getClaims', 'addBulkClaims']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);
    const cSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [PetrolReimbursmentComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: PetrolReimbursmentService, useValue: pSpy },
        { provide: MessageService, useValue: mSpy },
        { provide: ConfirmationService, useValue: cSpy }
      ]
    })
      .compileComponents();

    petrolServiceSpy = TestBed.inject(PetrolReimbursmentService) as jasmine.SpyObj<PetrolReimbursmentService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    confirmationServiceSpy = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;

    fixture = TestBed.createComponent(PetrolReimbursmentComponent);
    component = fixture.componentInstance;

    // Mock default returns
    petrolServiceSpy.getClaims.and.returnValue(of({ data: [] }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load claims on init', () => {
    expect(petrolServiceSpy.getClaims).toHaveBeenCalled();
  });

  it('should add new row', () => {
    component.openNew();
    component.addRow();
    expect(component.claimList.length).toBe(2);
  });

  it('should remove row', () => {
    component.openNew();
    component.addRow();
    component.removeRow(0);
    expect(component.claimList.length).toBe(1);
  });

  it('should save bulk claims', () => {
    component.claimList = [{
      amount: 100,
      from: 'A',
      to: 'B',
      purposeofVisit: 'Work',
      kms: 10,
      modeoftransport: 'Bike',
      updatedAt: new Date()
    }];

    petrolServiceSpy.addBulkClaims.and.returnValue(of({ message: 'Success' }));

    component.saveBulkClaims();

    expect(petrolServiceSpy.addBulkClaims).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
