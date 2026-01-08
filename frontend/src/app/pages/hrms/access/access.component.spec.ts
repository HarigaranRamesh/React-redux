import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { AccessComponent } from './access.component';
import { AccessService } from '../services/access/access.service';

describe('AccessComponent', () => {
  let component: AccessComponent;
  let fixture: ComponentFixture<AccessComponent>;

  let accessServiceSpy: jasmine.SpyObj<AccessService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AccessService', ['getHierarchy', 'assignMember', 'updateRoleAccess']);

    await TestBed.configureTestingModule({
      imports: [AccessComponent, HttpClientModule],
      providers: [
        { provide: AccessService, useValue: spy }
      ]
    })
      .compileComponents();

    accessServiceSpy = TestBed.inject(AccessService) as jasmine.SpyObj<AccessService>;
    fixture = TestBed.createComponent(AccessComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load hierarchy on init', () => {
    const mockData = { orgData: [], treeData: [] };
    accessServiceSpy.getHierarchy.and.returnValue(of(mockData));

    fixture.detectChanges(); // triggers ngOnInit

    expect(accessServiceSpy.getHierarchy).toHaveBeenCalled();
    expect(component.orgData).toEqual([]);
    expect(component.treeData).toEqual([]);
  });
});
