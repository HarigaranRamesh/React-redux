import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ActiveMembersComponent } from './active-members.component';
import { UserService } from '../services/user/user.service';

describe('ActiveMembersComponent', () => {
  let component: ActiveMembersComponent;
  let fixture: ComponentFixture<ActiveMembersComponent>;

  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const uSpy = jasmine.createSpyObj('UserService', ['getUsers']); // Add methods if used later

    await TestBed.configureTestingModule({
      imports: [ActiveMembersComponent, HttpClientModule, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: uSpy },
        { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add']) }
      ]
    })
      .compileComponents();

    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    fixture = TestBed.createComponent(ActiveMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
