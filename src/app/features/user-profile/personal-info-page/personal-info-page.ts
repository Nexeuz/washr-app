import { Component, OnInit, ChangeDetectionStrategy, signal, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterLink, Navigation } from '@angular/router';

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
import { AuthService } from '../../../core/services/auth';


// Typed Form Interface (No password fields)
interface PersonalInfoForm {
  name: FormControl<string | null>;
  dateOfBirth: FormControl<string | null>;
  email: FormControl<string | null>;
  gender: FormControl<'male' | 'female' | null>;
}

// Interface for displaying addresses in the list
interface AddressDisplayItem {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
}

// Interface for gender options in the select dropdown
interface GenderOption {
  value: 'male' | 'female';
  viewValue: string;
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
    PageHeaderComponent,
    ListItemComponent
  ],
  templateUrl: './personal-info-page.html',
  styleUrls: ['./personal-info-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalInfoPageComponent implements OnInit {
  @HostBinding('class.personal-info-page-host') hostClass = true;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  // private userDataService = inject(UserDataService); // Example

  personalInfoForm!: FormGroup<PersonalInfoForm>;

  addresses = signal<AddressDisplayItem[]>([
    { id: '1', iconName: 'home', title: '789 Maple Drive, Anytown, USA', subtitle: 'Primary Address' },
    { id: '2', iconName: 'work', title: '101 Pine Lane, Business City, USA', subtitle: 'Secondary Address' },
  ]);

  genderOptions: GenderOption[] = [
    { value: 'male', viewValue: 'Male' },
    { value: 'female', viewValue: 'Female' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.initializeForm();

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/auth/login']); // Should be handled by AuthGuard
      return;
    }

    // Pre-fill email and disable it if it comes from an auth provider
    // (social or if email/password user already has email confirmed)
    let prefilledEmail = currentUser.email || '';
    let isEmailDisabled = !!currentUser.email; // Disable if email is present from auth provider

    const navigation = this.router.getCurrentNavigation();
    const navigationState = navigation?.extras.state as { source?: string; email?: string; isNewUser?: boolean };

    // If coming from a specific sign-up flow that passes email, use that and disable
    if (navigationState?.source === 'emailSignUp' && navigationState?.email) {
        prefilledEmail = navigationState.email;
        isEmailDisabled = true;
    }
    
    this.personalInfoForm.patchValue({ email: prefilledEmail });
    if (isEmailDisabled) {
        this.personalInfoForm.get('email')?.disable();
    }

    // Pre-fill name from Auth if available (e.g., from social login)
    if (currentUser.displayName) {
        this.personalInfoForm.patchValue({ name: currentUser.displayName });
    }

    // In a real application, load the full user profile from Firestore
    // and patch the form with dateOfBirth, gender, etc.
    // this.loadUserProfile(currentUser.uid);
  }

  initializeForm(): void {
    this.personalInfoForm = this.fb.group({
      name: new FormControl('', Validators.required),
      dateOfBirth: new FormControl('', Validators.required),
      email: new FormControl({ value: '', disabled: false }, [Validators.required, Validators.email]),
      gender: new FormControl<'male' | 'female' | null>(null, Validators.required)
    });
    // No password fields or password match validator needed here
  }

  // loadUserProfile(uid: string): void {
  //   this.userDataService.getUserProfile(uid).subscribe(profile => {
  //     if (profile) {
  //       this.personalInfoForm.patchValue({
  //          name: profile.displayName,
  //          dateOfBirth: profile.dateOfBirth, // Ensure correct format
  //          gender: profile.gender
  //       });
  //       // Email is already handled and potentially disabled
  //       this.addresses.set(profile.addresses || []);
  //     }
  //   });
  // }

  async onSave(): Promise<void> {
    this.personalInfoForm.markAllAsTouched();
    if (this.personalInfoForm.invalid) {
      console.log('Personal Info Form is invalid. Please check the fields.');
      return;
    }

    const formData = this.personalInfoForm.getRawValue(); // Use getRawValue for all fields, including disabled email
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const profileDataToSave = {
        uid: currentUser.uid,
        email: formData.email, // This will be the pre-filled/disabled email
        displayName: formData.name,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        photoURL: currentUser.photoURL || null,
        authProviders: currentUser.providerData.map(p => p.providerId),
        isRegistrationComplete: true, // Mark registration as complete
        updatedAt: new Date(),
      };

      console.log('Saving profile data to Firestore (conceptual):', profileDataToSave);
      // await this.userDataService.setUserProfile(currentUser.uid, profileDataToSave);
      // this.notificationService.showSuccess("Profile saved successfully!");
      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      console.error('Error saving profile:', error);
      // this.notificationService.showError("Failed to save profile.");
    }
  }

  onAddAddress(): void {
    this.router.navigate(['/profile/edit-address']);
  }

  onEditAddress(addressId: string): void {
    this.router.navigate(['/profile/edit-address', addressId]);
  }


}