import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // For potential icons within this page
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { FileUploadPromptComponent } from '../../../shared/components/file-upload-prompt/file-upload-prompt';

// Shared Components

// Models or Services (Example)
// import { VehicleService } from '../../../core/services/vehicle.service';

// Typed Form Interface
interface AddVehicleForm {
  vehicleType: FormControl<string | null>;
  vehicleName: FormControl<string | null>;
  licensePlate: FormControl<string | null>;
  isTaxi: FormControl<boolean | null>;
  // vehiclePhotos: FormControl<FileList | null>; // If you want to manage files directly in the form
}

// Options for Vehicle Type Radio Group
interface VehicleTypeOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-vehicle-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,      // Shared Page Header
    FileUploadPromptComponent // Shared File Upload
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
  pageTitle = 'Add your vehicle'; // For the PageHeaderComponent

  vehicleTypeOptions: VehicleTypeOption[] = [
    { value: 'motorcycle', viewValue: 'Motorcycle' },
    { value: 'car', viewValue: 'Car' },
  ];

  // Signals to manage selected photos and their previews
  selectedVehiclePhotos = signal<FileList | null>(null);
  vehiclePhotoPreviews = signal<(string | ArrayBuffer | null)[]>([]);

  constructor() {
    this.addVehicleForm = this.fb.group({
      vehicleType: new FormControl('car', Validators.required), // Default to 'car'
      vehicleName: new FormControl('', Validators.required),
      licensePlate: new FormControl('', Validators.required),
      isTaxi: new FormControl(false), // Default to false
      // vehiclePhotos: new FormControl(null) // Not directly bound, handled by selectedVehiclePhotos signal
    });
  }

  ngOnInit(): void {
    // Initialization logic if any
  }

  onVehiclePhotosSelected(files: FileList): void {
    this.selectedVehiclePhotos.set(files);
    const previews: (string | ArrayBuffer | null)[] = [];

    if (files && files.length > 0) {
      const filesToPreviewArray = Array.from(files).slice(0, 5); // Limit previews for display
      let filesProcessed = 0;

      if (filesToPreviewArray.length === 0) {
        this.vehiclePhotoPreviews.set([]);
        return;
      }

      for (const file of filesToPreviewArray) {
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result);
          filesProcessed++;
          if (filesProcessed === filesToPreviewArray.length) {
            this.vehiclePhotoPreviews.set([...previews]);
          }
        };
        reader.readAsDataURL(file);
      }
      console.log(`${files.length} vehicle photo(s) selected.`);
    } else {
      this.vehiclePhotoPreviews.set([]);
    }
  }

  onAddVehicle(): void {
    this.addVehicleForm.markAllAsTouched(); // Ensure validation messages appear if form is invalid
    if (this.addVehicleForm.valid) {
      const formValue = this.addVehicleForm.value;
      const photosToUpload = this.selectedVehiclePhotos();

      console.log('Adding Vehicle Form Data:', formValue);
      if (photosToUpload && photosToUpload.length > 0) {
        console.log(`With ${photosToUpload.length} photo(s):`);
        Array.from(photosToUpload).forEach(file => console.log(`  - ${file.name}`));
      } else {
        console.log('No photos selected.');
      }

      // Example: Construct FormData for submission if including files
      // const formData = new FormData();
      // formData.append('vehicleType', formValue.vehicleType || '');
      // formData.append('vehicleName', formValue.vehicleName || '');
      // // ... append other form fields ...
      // if (photosToUpload) {
      //   for (let i = 0; i < photosToUpload.length; i++) {
      //     formData.append('photos', photosToUpload[i], photosToUpload[i].name);
      //   }
      // }
      // this.vehicleService.addVehicle(formData).subscribe(...)

      this.onDone(); // Navigate after "successful" submission for demo
    } else {
      console.log('Add Vehicle Form is invalid. Please check the fields.');
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