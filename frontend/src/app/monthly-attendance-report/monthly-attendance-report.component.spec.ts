import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyAttendanceReportComponent } from './monthly-attendance-report.component';

describe('MonthlyAttendanceReportComponent', () => {
  let component: MonthlyAttendanceReportComponent;
  let fixture: ComponentFixture<MonthlyAttendanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyAttendanceReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyAttendanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
