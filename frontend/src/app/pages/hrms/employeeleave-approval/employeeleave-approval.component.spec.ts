import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeleaveApprovalComponent } from './employeeleave-approval.component';

describe('EmployeeleaveApprovalComponent', () => {
  let component: EmployeeleaveApprovalComponent;
  let fixture: ComponentFixture<EmployeeleaveApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeleaveApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeleaveApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
