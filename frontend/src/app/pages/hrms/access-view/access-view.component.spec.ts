import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { AccessViewComponent } from './access-view.component';
import { AccessService } from '../services/access/access.service';

describe('AccessViewComponent', () => {
  let component: AccessViewComponent;
  let fixture: ComponentFixture<AccessViewComponent>;

  let accessServiceSpy: jasmine.SpyObj<AccessService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AccessService', ['getHierarchy']);

    await TestBed.configureTestingModule({
      imports: [AccessViewComponent, HttpClientModule],
      providers: [
        { provide: AccessService, useValue: spy }
      ]
    })
      .compileComponents();

    accessServiceSpy = TestBed.inject(AccessService) as jasmine.SpyObj<AccessService>;
    fixture = TestBed.createComponent(AccessViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hierarchy on init', () => {
    const mockData = { orgData: [], treeData: [] };
    accessServiceSpy.getHierarchy.and.returnValue(of(mockData));

    fixture.detectChanges();

    expect(accessServiceSpy.getHierarchy).toHaveBeenCalled();
    expect(component.orgData).toEqual([]);
    expect(component.treeData).toEqual([]);
  });
});
