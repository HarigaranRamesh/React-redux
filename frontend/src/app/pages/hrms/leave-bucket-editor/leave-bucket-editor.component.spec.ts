import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveBucketEditorComponent } from './leave-bucket-editor.component';

describe('LeaveBucketEditorComponent', () => {
  let component: LeaveBucketEditorComponent;
  let fixture: ComponentFixture<LeaveBucketEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveBucketEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveBucketEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
