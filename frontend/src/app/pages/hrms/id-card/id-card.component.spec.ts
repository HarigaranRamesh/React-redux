import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IdCardComponent } from './id-card.component';

describe('IdCardComponent', () => {
  let component: IdCardComponent;
  let fixture: ComponentFixture<IdCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdCardComponent, FormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => 'test@example.com'
              }
            }
          }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(IdCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user data', () => {
    expect(component.user).toBeDefined();
    expect(component.user.email).toBe('bala@vmm.org'); // Based on hardcoded data
  });

  it('should get email from query params', () => {
    expect(component.emailFromQuery).toBe('test@example.com');
  });
});
