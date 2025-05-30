// Path: src/app/features/user-profile/personal-info-page/personal-info-page.component.ts
import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ListItemComponent } from '../../../shared/components/list-item/list-item';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { IconComponent } from '../../../shared/components/icon/icon';
import { SelectFieldComponent, SelectOption } from '../../../shared/components/select-field/select-field';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field';
import { ButtonComponent } from '../../../shared/components/button/button';

// Shared Components

// Models (assuming these are defined in shared/models/)
// import { User } from '../../../shared/models/user.model';
// import { Address } from '../../../shared/models/address.model';

// Helper for password matching validator
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const repeatPassword = control.get('repeatPassword');

  if (password && repeatPassword && password.value !== repeatPassword.value) {
    repeatPassword.setErrors({ passwordsNotMatching: true });
    return { passwordsNotMatching: true };
  } else if (repeatPassword && repeatPassword.hasError('passwordsNotMatching') && password?.value === repeatPassword?.value) {
    // Clear error if they now match
    repeatPassword.setErrors(null);
  }
  return null;
}

// Define a typed interface for the form
interface PersonalInfoForm {
  name: FormControl<string | null>;
  dateOfBirth: FormControl<string | null>; // Dates are typically strings from date input
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  repeatPassword: FormControl<string | null>;
  gender: FormControl<string | null>;
}

// Example Address data structure
interface AddressDisplayItem {
  id: string;
  iconSvg: string;
  title: string;   // Was 'label' in previous ListItemComponent example, aligning with its input
  subtitle: string; // Was 'type'
}

@Component({
  selector: 'app-personal-info-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    InputFieldComponent,
    SelectFieldComponent,
    IconComponent,
    PageHeaderComponent,
    ListItemComponent
  ],
  templateUrl: './personal-info-page.html',
  styleUrls: ['./personal-info-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalInfoPageComponent implements OnInit {
  personalInfoForm!: FormGroup<PersonalInfoForm>;

  // Example SVGs - manage these better in a real app (e.g., an IconService or constants file)
  readonly calendarIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"></path></svg>`;
  readonly houseIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"></path></svg>`;
  readonly briefcaseIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200Z"></path></svg>`;

  addresses = signal<AddressDisplayItem[]>([
    { id: '1', iconSvg: this.houseIconSvg, title: '789 Maple Drive', subtitle: 'Primary Address' },
    { id: '2', iconSvg: this.briefcaseIconSvg, title: '101 Pine Lane', subtitle: 'Secondary Address' },
  ]);

  genderOptions: SelectOption[] = [
    // First option is often handled by defaultOptionText in SelectFieldComponent
    // { label: 'Select your gender', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.personalInfoForm = this.fb.group({
      name: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      repeatPassword: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required)
    }, { validators: passwordsMatchValidator });
  }

  onSave(): void {
    if (this.personalInfoForm.valid) {
      console.log('Saving Personal Info:', this.personalInfoForm.value);
      // TODO: Implement actual save logic (e.g., call a service)
      // Example: this.userDataService.updateProfile(this.personalInfoForm.value).subscribe(...);
    } else {
      this.personalInfoForm.markAllAsTouched(); // Show validation errors
      console.log('Personal Info Form is invalid');
    }
  }

  onAddAddress(): void {
    console.log('Navigate to add address page or open modal');
    // This would typically navigate to a dedicated page or open the BottomSheetComponent
    // For now, let's assume it navigates to the edit-address page in "add" mode
    this.router.navigate(['/profile/edit-address']); // Adjust if you have a specific "add" route or use a modal
  }

  onEditAddress(addressId: string): void {
    console.log('Navigate to edit address for ID:', addressId);
    this.router.navigate(['/profile/edit-address', addressId]); // Assuming a route like /profile/edit-address/:id
  }

  goBack(): void {
    // This could use Angular's Location service or navigate to a specific previous route
    // For simplicity, let's assume a common "dashboard" or "profile overview" page
    this.router.navigate(['/profile']); // Adjust as needed
    console.log('Go back triggered');
  }
}