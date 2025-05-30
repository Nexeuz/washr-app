import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioChipGroup } from './radio-chip-group';

describe('RadioChipGroup', () => {
  let component: RadioChipGroup;
  let fixture: ComponentFixture<RadioChipGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioChipGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioChipGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
