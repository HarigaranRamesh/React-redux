import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { AccessdefineComponent } from './accessdefine.component';
import { AccessdefineService } from '../services/access/accessdefine.service';

describe('AccessdefineComponent', () => {
  let component: AccessdefineComponent;
  let fixture: ComponentFixture<AccessdefineComponent>;

  let accessServiceSpy: jasmine.SpyObj<AccessdefineService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const aSpy = jasmine.createSpyObj('AccessdefineService', ['getRoles', 'getRoleMain', 'getStandardMenu', 'saveRoleMain']);
    const mSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [AccessdefineComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: AccessdefineService, useValue: aSpy },
        { provide: MessageService, useValue: mSpy }
      ]
    })
      .compileComponents();

    accessServiceSpy = TestBed.inject(AccessdefineService) as jasmine.SpyObj<AccessdefineService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    fixture = TestBed.createComponent(AccessdefineComponent);
    component = fixture.componentInstance;

    // Mock default returns
    accessServiceSpy.getRoles.and.returnValue(of([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load roles on init', () => {
    expect(accessServiceSpy.getRoles).toHaveBeenCalled();
  });

  it('should handle role change', () => {
    const mockRoleMain = { role: 'Admin', main: [] };
    const mockStdMenu = { role: 'Admin', main: [] };

    accessServiceSpy.getRoleMain.and.returnValue(of(mockRoleMain));
    accessServiceSpy.getStandardMenu.and.returnValue(of(mockStdMenu));

    component.roles = [{ _id: '1', role: 'Admin' }];
    component.selectedRoleId = '1';

    component.onRoleChange();

    expect(accessServiceSpy.getRoleMain).toHaveBeenCalledWith('1');
    expect(accessServiceSpy.getStandardMenu).toHaveBeenCalledWith('Admin');
  });
});
