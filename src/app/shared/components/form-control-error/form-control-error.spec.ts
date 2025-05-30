import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControlError } from './form-control-error';

describe('FormControlError', () => {
  let component: FormControlError;
  let fixture: ComponentFixture<FormControlError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormControlError]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormControlError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
