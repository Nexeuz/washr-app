import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVehiclePage } from './add-vehicle-page';

describe('AddVehiclePage', () => {
  let component: AddVehiclePage;
  let fixture: ComponentFixture<AddVehiclePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVehiclePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddVehiclePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
