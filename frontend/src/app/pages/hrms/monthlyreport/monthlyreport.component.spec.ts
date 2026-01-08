import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { MonthlyreportComponent } from './monthlyreport.component';
import { AttendanceService } from '../services/attendance/attendance.service';

describe('MonthlyreportComponent', () => {
  let component: MonthlyreportComponent;
  let fixture: ComponentFixture<MonthlyreportComponent>;

  let attendanceServiceSpy: jasmine.SpyObj<AttendanceService>;

  beforeEach(async () => {
    const aSpy = jasmine.createSpyObj('AttendanceService', ['getMonthlyPivot']);

    await TestBed.configureTestingModule({
      imports: [MonthlyreportComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: AttendanceService, useValue: aSpy }
      ]
    })
      .compileComponents();

    attendanceServiceSpy = TestBed.inject(AttendanceService) as jasmine.SpyObj<AttendanceService>;

    fixture = TestBed.createComponent(MonthlyreportComponent);
    component = fixture.componentInstance;

    // Mock default returns
    attendanceServiceSpy.getMonthlyPivot.and.returnValue(of({ success: true, dates: [], users: {} }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pivot report on init', () => {
    expect(attendanceServiceSpy.getMonthlyPivot).toHaveBeenCalled();
  });

  it('should reload report on month change', () => {
    component.onMonthChange();
    expect(attendanceServiceSpy.getMonthlyPivot).toHaveBeenCalledTimes(2); // Once on init, once on change
  });

  it('should get cell class', () => {
    expect(component.getCellClass('Present')).toBe('cell-present');
    expect(component.getCellClass('Absent')).toBe('cell-absent');
    expect(component.getCellClass(null)).toBe('cell-null');
  });
});
