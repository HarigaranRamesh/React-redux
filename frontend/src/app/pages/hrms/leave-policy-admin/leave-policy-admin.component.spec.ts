import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { LeavePolicyAdminComponent } from './leave-policy-admin.component';
import { LeavePoliciesService } from '../services/leavepolicy/leave-policies.service';

describe('LeavePolicyAdminComponent', () => {
  let component: LeavePolicyAdminComponent;
  let fixture: ComponentFixture<LeavePolicyAdminComponent>;

  let leavePoliciesServiceSpy: jasmine.SpyObj<LeavePoliciesService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const lSpy = jasmine.createSpyObj('LeavePoliciesService', ['getRoles', 'getPolicies', 'createPolicy', 'updatePolicy', 'deletePolicy']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [LeavePolicyAdminComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: LeavePoliciesService, useValue: lSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    leavePoliciesServiceSpy = TestBed.inject(LeavePoliciesService) as jasmine.SpyObj<LeavePoliciesService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(LeavePolicyAdminComponent);
    component = fixture.componentInstance;

    // Mock default returns
    leavePoliciesServiceSpy.getRoles.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load roles on init', () => {
    expect(leavePoliciesServiceSpy.getRoles).toHaveBeenCalled();
  });

  it('should load policies on role change', () => {
    component.selectedRoleName = 'Admin';
    leavePoliciesServiceSpy.getPolicies.and.returnValue(of([]));

    component.onRoleChange();

    expect(leavePoliciesServiceSpy.getPolicies).toHaveBeenCalledWith('Admin');
  });

  it('should add new row', () => {
    component.selectedRoleName = 'Admin';
    component.addNewRow();
    expect(component.newRows.length).toBe(1);
    expect(component.newRows[0].role).toBe('Admin');
  });

  it('should save new rows', () => {
    component.selectedRoleName = 'Admin';
    component.newRows = [{ role: 'Admin', label: 'Sick Leave', amount: 1, accrualType: 'monthly' }];

    leavePoliciesServiceSpy.createPolicy.and.returnValue(of({ data: { role: 'Admin', label: 'Sick Leave', amount: 1, accrualType: 'monthly' } }));

    component.saveAllNew();

    expect(leavePoliciesServiceSpy.createPolicy).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
