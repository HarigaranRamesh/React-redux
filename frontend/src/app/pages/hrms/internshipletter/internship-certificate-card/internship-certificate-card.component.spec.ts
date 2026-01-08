import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternshipCertificateCardComponent } from './internship-certificate-card.component';

describe('InternshipCertificateCardComponent', () => {
  let component: InternshipCertificateCardComponent;
  let fixture: ComponentFixture<InternshipCertificateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternshipCertificateCardComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(InternshipCertificateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default certificate if none provided', () => {
    expect(component.certificate).toBeDefined();
    expect(component.certificate.companyName).toBe('Unison Technologies');
  });

  it('should emit download event', () => {
    spyOn(component.download, 'emit');
    component.onDownload();
    expect(component.download.emit).toHaveBeenCalled();
  });
});
