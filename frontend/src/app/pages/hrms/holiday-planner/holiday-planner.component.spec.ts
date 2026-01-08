import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { HolidayPlannerComponent } from './holiday-planner.component';
import { HolidayService } from '../services/holiday/holiday.service';

describe('HolidayPlannerComponent', () => {
  let component: HolidayPlannerComponent;
  let fixture: ComponentFixture<HolidayPlannerComponent>;

  let holidayServiceSpy: jasmine.SpyObj<HolidayService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const hSpy = jasmine.createSpyObj('HolidayService', ['getRules', 'createRule', 'createRulesBulk', 'setEnabled', 'deleteRule', 'importBulkFile']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [HolidayPlannerComponent, HttpClientModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: HolidayService, useValue: hSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    holidayServiceSpy = TestBed.inject(HolidayService) as jasmine.SpyObj<HolidayService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(HolidayPlannerComponent);
    component = fixture.componentInstance;

    // Mock default returns
    holidayServiceSpy.getRules.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load rules on init', () => {
    expect(holidayServiceSpy.getRules).toHaveBeenCalled();
  });

  it('should save single rule', () => {
    component.addSingleForm.patchValue({
      name: 'Test Holiday',
      date: new Date(),
      color: '00E5FF'
    });

    holidayServiceSpy.createRule.and.returnValue(of({ name: 'Test Holiday', isEnabled: true }));

    component.saveSingle();

    expect(holidayServiceSpy.createRule).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('should save recurring rule', () => {
    component.addRecurringForm.patchValue({
      name: 'Recurring Holiday',
      color: '9B59B6',
      nths: [1],
      weekdays: [1],
      months: [0]
    });

    holidayServiceSpy.createRule.and.returnValue(of({ name: 'Recurring Holiday', isEnabled: true }));

    component.saveRecurring();

    expect(holidayServiceSpy.createRule).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });
});
