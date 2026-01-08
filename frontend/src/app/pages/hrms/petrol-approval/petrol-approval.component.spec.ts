import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { PetrolApprovalComponent } from './petrol-approval.component';
import { PetrolService } from '../services/petrol/petrol.service';

describe('PetrolApprovalComponent', () => {
  let component: PetrolApprovalComponent;
  let fixture: ComponentFixture<PetrolApprovalComponent>;

  let petrolServiceSpy: jasmine.SpyObj<PetrolService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const pSpy = jasmine.createSpyObj('PetrolService', ['getBulkPetrolCredits', 'approveClaim', 'approveAllClaims']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [PetrolApprovalComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: PetrolService, useValue: pSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    petrolServiceSpy = TestBed.inject(PetrolService) as jasmine.SpyObj<PetrolService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(PetrolApprovalComponent);
    component = fixture.componentInstance;

    // Mock default returns
    petrolServiceSpy.getBulkPetrolCredits.and.returnValue(of({ data: [], total: 0 }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load bulk credits on init', () => {
    expect(petrolServiceSpy.getBulkPetrolCredits).toHaveBeenCalled();
  });

  it('should submit approval action', () => {
    component.selectedClaimId = '123';
    component.actionType = 'approve';
    component.remarks = 'Approved';

    petrolServiceSpy.approveClaim.and.returnValue(of({}));

    component.submitAction();

    expect(petrolServiceSpy.approveClaim).toHaveBeenCalledWith('123', jasmine.objectContaining({ approved: true }));
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should approve all claims', () => {
    const user = { userId: 'u1' };
    petrolServiceSpy.approveAllClaims.and.returnValue(of({ message: 'Success' }));

    component.approveAllClaims(user);

    expect(petrolServiceSpy.approveAllClaims).toHaveBeenCalledWith('u1', jasmine.any(Object));
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
