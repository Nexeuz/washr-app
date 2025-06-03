import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { ListItemComponent } from '../../../shared/components/list-item/list-item';

// Shared Components (Ensure these are created and imported correctly from your shared directory)


// Custom Validator for matching passwords
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const repeatPassword = control.get('repeatPassword');

  if (password && repeatPassword && password.value !== repeatPassword.value) {
    // Set error on repeatPassword field if they don't match
    repeatPassword.setErrors({ passwordsNotMatching: true });
    return { passwordsNotMatching: true }; // Return error for the form group
  } else if (repeatPassword && repeatPassword.hasError('passwordsNotMatching') && password?.value === repeatPassword?.value) {
    // Clear error from repeatPassword if they now match
    repeatPassword.setErrors(null);
  }
  return null; // No error for the form group if they match or fields are not present
}

// Typed Form Interface
interface PersonalInfoForm {
  name: FormControl<string | null>;
  dateOfBirth: FormControl<string | null>; // Dates from <input type="date"> are strings
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  repeatPassword: FormControl<string | null>;
  gender: FormControl<string | null>;
}

// Interface for displaying addresses in the list
interface AddressDisplayItem {
  id: string;
  iconName: string; // Material Icon name (e.g., 'home', 'work')
  title: string;    // Main address line
  subtitle: string; // e.g., "Primary Address"
}

// Interface for gender options in the select dropdown
interface GenderOption {
  value: string;
  viewValue: string; // Text displayed to the user
}

@Component({
  selector: 'app-personal-info-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    PageHeaderComponent,  // Shared page header
    ListItemComponent     // Shared list item
  ],
  templateUrl: './personal-info-page.html',
  styleUrls: ['./personal-info-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalInfoPageComponent implements OnInit {
  // Using inject() for dependency injection
  private fb = inject(FormBuilder);
  private router = inject(Router);
  // private userDataService = inject(UserDataService); // Example for future data operations

  personalInfoForm!: FormGroup<PersonalInfoForm>;

  // Example data for addresses, to be replaced with actual data from a service
  addresses = signal<AddressDisplayItem[]>([
    { id: '1', iconName: 'home', title: '789 Maple Drive, Anytown, USA', subtitle: 'Primary Address' },
    { id: '2', iconName: 'work', title: '101 Pine Lane, Business City, USA', subtitle: 'Secondary Address' },
        { id: '3', iconName: 'work', title: '101 Pine Lane, Business City, USA', subtitle: 'Secondary Address' },

  ]);

  // Options for the gender select dropdown
  genderOptions: GenderOption[] = [
    { value: 'male', viewValue: 'Male' },
    { value: 'female', viewValue: 'Female' }
  ];

  constructor() {}

  ngOnInit(): void {
    this.personalInfoForm = this.fb.group({
      name: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]), // Example: min 8 chars
      repeatPassword: new FormControl('', Validators.required), // Validator for matching is at group level
      gender: new FormControl('', Validators.required)
    }, { validators: passwordsMatchValidator }); // Apply the custom validator to the form group

    // In a real app, you would load existing user data here and patch the form
    // this.loadUserData();
  }

  // loadUserData(): void {
  //   this.userDataService.getCurrentUserProfile().subscribe(user => {
  //     if (user) {
  //       this.personalInfoForm.patchValue(user); // Assuming user object matches form structure
  //       // Load addresses separately
  //       this.addresses.set(user.addresses || []);
  //     }
  //   });
  // }

  onSave(): void {
    this.personalInfoForm.markAllAsTouched(); // Mark all fields as touched to show errors
    if (this.personalInfoForm.valid) {
      console.log('Saving Personal Info:', this.personalInfoForm.value);
      // TODO: Implement actual save logic (e.g., call a service to update user profile)
      // Example: this.userDataService.updateProfile(this.personalInfoForm.value).subscribe({
      //   next: () => console.log('Profile updated successfully!'),
      //   error: (err) => console.error('Error updating profile:', err)
      // });
    } else {
      console.log('Personal Info Form is invalid. Please check the fields.');
    }
  }

  onAddAddress(): void {
    console.log('Navigating to add address page or opening modal/bottom sheet.');
    // This would typically navigate to a dedicated page or open the MatBottomSheet
    // for the AddressFormComponent.
    this.router.navigate(['/profile/edit-address']); // Assuming a route for adding new address
  }

  onEditAddress(addressId: string): void {
    console.log('Navigating to edit address for ID:', addressId);
    this.router.navigate(['/profile/edit-address', addressId]); // Assuming a route like /profile/edit-address/:id
  }

  goBack(): void {
    // This could use Angular's Location service or navigate to a specific previous route
    // For simplicity, let's assume a common "dashboard" or "profile overview" page
    this.router.navigate(['/dashboard']); // Adjust as needed (e.g., to '/profile' or use Location.back())
    console.log('Back button clicked on Personal Info page.');
  }
}