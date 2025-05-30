// Path: src/app/features/vehicles/add-vehicle-page/add-vehicle-page.component.ts
import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field';
import { RadioChipGroupComponent, RadioChipOption } from '../../../shared/components/radio-chip-group/radio-chip-group';
import { ToggleSwitchComponent } from '../../../shared/components/toggle-switch/toggle-switch';
import { FileUploadPromptComponent } from '../../../shared/components/file-upload-prompt/file-upload-prompt';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';


// import { IconComponent } from '../../../shared/components/icon/icon.component'; // If needed directly

// Models
// import { VehicleService } from '../../../core/services/vehicle.service'; // Example service

interface AddVehicleForm {
  vehicleType: FormControl<string | null>; // e.g., 'motorcycle', 'car'
  vehicleName: FormControl<string | null>;
  licensePlate: FormControl<string | null>;
  isTaxi: FormControl<boolean | null>;
  vehiclePhoto?: FormControl<File | null>; // Optional, as photo might be handled separately
}

@Component({
  selector: 'app-add-vehicle-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    InputFieldComponent,
    RadioChipGroupComponent,
    ToggleSwitchComponent,
    FileUploadPromptComponent,
    PageHeaderComponent,
    // IconComponent
  ],
  templateUrl: './add-vehicle-page.html',
  styleUrls: ['./add-vehicle-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddVehiclePageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  // private vehicleService = inject(VehicleService); // Example

  addVehicleForm!: FormGroup<AddVehicleForm>;
  pageTitle = signal('Add your vehicle'); // Could be dynamic if editing

  vehicleTypeOptions: RadioChipOption[] = [
    { label: 'Motorcycle', value: 'motorcycle' },
    { label: 'Car', value: 'car' },
  ];

  selectedVehiclePhoto = signal<File | null>(null);
  vehiclePhotoPreview = signal<string | ArrayBuffer | null>(null);


  constructor() {
    this.addVehicleForm = this.fb.group({
      vehicleType: new FormControl('car', Validators.required), // Default to 'car'
      vehicleName: new FormControl('', Validators.required),
      licensePlate: new FormControl('', Validators.required),
      isTaxi: new FormControl(false), // Default to false
      // vehiclePhoto: new FormControl(null) // Optional: if you want to include file in form
    });
  }

  ngOnInit(): void {
    // Any initialization logic
  }

  onVehiclePhotoSelected(file: File): void {
    this.selectedVehiclePhoto.set(file);
    // this.addVehicleForm.patchValue({ vehiclePhoto: file }); // If including in form

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      this.vehiclePhotoPreview.set(reader.result);
    };
    reader.readAsDataURL(file);

    console.log('Vehicle photo selected:', file.name);
  }

  onAddVehicle(): void {
    if (this.addVehicleForm.valid) {
      const formValue = this.addVehicleForm.value;
      const vehicleData = {
        ...formValue,
        photo: this.selectedVehiclePhoto() // Add selected photo separately
      };
      console.log('Adding Vehicle:', vehicleData);
      // Example: this.vehicleService.addVehicle(vehicleData).subscribe({
      //   next: () => {
      //     console.log('Vehicle added successfully');
      //     this.router.navigate(['/vehicles/list']); // Or wherever appropriate
      //   },
      //   error: (err) => console.error('Error adding vehicle', err)
      // });
      // For demo, navigate or show success
      this.onDone();
    } else {
      this.addVehicleForm.markAllAsTouched();
      console.log('Add Vehicle Form is invalid');
    }
  }

  onDone(): void {
    // Navigate to a relevant page, e.g., vehicle list or user profile
    console.log('Done button clicked - navigating away.');
    this.router.navigate(['/profile/personal-info']); // Example navigation
  }

  handleHeaderBackClick(): void {
    // Navigate to a previous relevant page, perhaps user profile or a vehicle list
    this.router.navigate(['/profile/personal-info']); // Example
  }
}