import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { HolidayCalendarViewComponent } from './holiday-calendar-view.component';
import { HolidayService } from '../services/holiday/holiday.service';

describe('HolidayCalendarViewComponent', () => {
  let component: HolidayCalendarViewComponent;
  let fixture: ComponentFixture<HolidayCalendarViewComponent>;

  let holidayServiceSpy: jasmine.SpyObj<HolidayService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const hSpy = jasmine.createSpyObj('HolidayService', ['getRules']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [HolidayCalendarViewComponent, HttpClientModule],
      providers: [
        { provide: HolidayService, useValue: hSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    holidayServiceSpy = TestBed.inject(HolidayService) as jasmine.SpyObj<HolidayService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(HolidayCalendarViewComponent);
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

  it('should navigate months', () => {
    const initialMonth = component.month();
    const initialYear = component.year();

    component.nextMonth();
    if (initialMonth === 11) {
      expect(component.month()).toBe(0);
      expect(component.year()).toBe(initialYear + 1);
    } else {
      expect(component.month()).toBe(initialMonth + 1);
    }

    component.prevMonth();
    expect(component.month()).toBe(initialMonth);
    expect(component.year()).toBe(initialYear);
  });
});
