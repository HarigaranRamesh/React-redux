import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ViewUsersComponent } from './view-users.component';
import { UserService } from '../services/user/user.service';

describe('ViewUsersComponent', () => {
  let component: ViewUsersComponent;
  let fixture: ComponentFixture<ViewUsersComponent>;

  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const hSpy = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [ViewUsersComponent, HttpClientModule, FormsModule],
      providers: [
        { provide: HttpClient, useValue: hSpy }
      ]
    })
      .compileComponents();

    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    fixture = TestBed.createComponent(ViewUsersComponent);
    component = fixture.componentInstance;

    // Mock default returns
    httpSpy.get.and.returnValue(of({ data: [], total: 0, limit: 10 }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    expect(httpSpy.get).toHaveBeenCalled();
  });

  it('should filter users', () => {
    component.searchText = 'Test';
    component.selectedField = { value: 'user_name' };

    component.loadUsers({ first: 0, rows: 10, page: 0 });

    expect(httpSpy.get).toHaveBeenCalledWith(
      jasmine.any(String),
      jasmine.objectContaining({
        params: jasmine.objectContaining({
          updates: jasmine.arrayContaining([
            jasmine.objectContaining({ param: 'user_name', value: 'Test' })
          ])
        })
      })
    );
  });
});
