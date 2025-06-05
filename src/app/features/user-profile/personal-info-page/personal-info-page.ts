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
import {MatDatepickerModule} from '@angular/material/datepicker';


// Shared Components


// Services
// Firestore
import { doc, getDoc, setDoc, serverTimestamp, DocumentData, getDocFromCache, Timestamp, getDocs, collection, onSnapshot, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { ListItemComponent } from '../../../shared/components/list-item/list-item';
import { AuthService } from '../../../core/services/auth';
import { provideNativeDateAdapter } from '@angular/material/core';

// Typed Form Interface (No password fields)
interface PersonalInfoForm {
  name: FormControl<string | null>;
  dateOfBirth: FormControl<Date | null>;
  email: FormControl<string | null>;
  gender: FormControl<'male' | 'female' | null>;
}

// Interface for displaying addresses in the list
interface AddressDisplayItem {
  id: string;
  iconKey: string;
  fullAddress: string;
  createdAt: Timestamp;
  label: string;
}

// Interface for gender options in the select dropdown
interface GenderOption {
  value: 'male' | 'female';
  viewValue: string;
}

const addressConverter: FirestoreDataConverter<AddressDisplayItem> = {
  toFirestore(address: AddressDisplayItem): DocumentData {
    return {
      iconKey: address.iconKey,
      fullAddress: address.fullAddress,
      createdAt: address.createdAt,
      label: address.label
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): AddressDisplayItem {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      iconKey: data['iconKey'],
      fullAddress: data['fullAddress'],
      createdAt: data['createdAt'],
      label: data['label']
    };
  }
};

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
    ListItemComponent,
    MatDatepickerModule,
  ],
  templateUrl: './personal-info-page.html',
  styleUrls: ['./personal-info-page.scss'],
    providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalInfoPageComponent implements OnInit {
  @HostBinding('class.personal-info-page-host') hostClass = true;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private firestore = inject(Firestore);

  personalInfoForm!: FormGroup<PersonalInfoForm>;
  // This signal indicates if the page is for initial profile completion vs. editing
  isProfileCompletionMode = signal(false);


  addresses = signal<AddressDisplayItem[]>([
    // Example data, load from Firestore subcollection in real app
    // { id: '1', iconName: 'home', title: '789 Maple Drive, Anytown, USA', subtitle: 'Primary Address' },
    // { id: '2', iconName: 'work', title: '101 Pine Lane, Business City, USA', subtitle: 'Secondary Address' },
  ]);

  genderOptions: GenderOption[] = [
    { value: 'male', viewValue: 'Male' },
    { value: 'female', viewValue: 'Female' },
  ];

  constructor() {}

  ngOnInit(): void {
    this.initializeForm();

    this.authService.authState$.subscribe(user => {
      if (user) {
         const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
          this.router.navigate(['/auth/login']); // Should be caught by AuthGuard
          return;
        }
    // Ensure user document exists in Firestore and load data
    this.checkAndLoadUserProfile(currentUser);
      }

    })


  }

  initializeForm(): void {
    this.personalInfoForm = this.fb.group({
      name: new FormControl('', Validators.required),
      dateOfBirth: new FormControl<Date | null>(null, Validators.required),
      email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]), // Email usually pre-filled and disabled
      gender: new FormControl<'male' | 'female' | null>(null, Validators.required)
    });
  }

async checkAndLoadUserProfile(currentUser: User): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
    try {
    let docSnap;

    // Try loading from cache first (optional)
    try {
      docSnap = await getDocFromCache(userDocRef);
      console.log('📦 Loaded profile from cache');
    } catch (cacheError) {
      console.warn('⚠️ No cache found. Loading from server...');
      docSnap = await getDoc(userDocRef);
    }      
    let userProfileData: DocumentData | null = null;

      if (!docSnap.exists()) {
        console.log(`PersonalInfoPage: No profile found for user ${currentUser.uid}. Creating initial Firestore document.`);
        const initialProfileData = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || null,
          authProviders: currentUser.providerData.map(p => p.providerId),
          isRegistrationComplete: false, // New profiles are incomplete
          createdAt: serverTimestamp(), // Firestore server timestamp
          updatedAt: serverTimestamp(),
          dateOfBirth: null, // Initialize other profile fields
          gender: null,
        };
        await setDoc(userDocRef, initialProfileData);
        userProfileData = initialProfileData; // Use this data to patch form
        this.isProfileCompletionMode.set(true);
      } else {
        userProfileData = docSnap.data();
        if (userProfileData['isRegistrationComplete'] === false) {
          this.isProfileCompletionMode.set(true);
          console.log(`PersonalInfoPage: Profile for user ${currentUser.uid} exists but is incomplete.`);
        } else {
          this.isProfileCompletionMode.set(false);
          this.router.navigateByUrl('/dasboard')
          console.log(`PersonalInfoPage: Profile for user ${currentUser.uid} is complete. Editing mode.`);
        }
      }

      // Patch form with data
      if (userProfileData) {
        this.personalInfoForm.patchValue({
          name: userProfileData['displayName'] || currentUser.displayName || '',
          email: userProfileData['email'] || currentUser.email || '',
          // Handle dateOfBirth: Firestore might store it as a Timestamp or an ISO string
          dateOfBirth: userProfileData['dateOfBirth']
            ? (userProfileData['dateOfBirth'] instanceof Timestamp
              ? userProfileData['dateOfBirth'].toDate()
              : new Date(userProfileData['dateOfBirth']))
            : null,
          gender: userProfileData['gender'] || null
        });
      }

      // Ensure email is pre-filled from auth and disabled
      if (currentUser.email) {
        this.personalInfoForm.get('email')?.setValue(currentUser.email);
        this.personalInfoForm.get('email')?.disable();
      } else {
        // If auth user has no email (e.g. phone auth only, rare for web), enable it
        this.personalInfoForm.get('email')?.enable();
      }



      // Conceptual: Load addresses if they are part of this profile page's responsibility
      this.loadUserAddresses(currentUser.uid);

    } catch (error) {
      console.error("PersonalInfoPage: Error checking/loading user profile:", error);
      // Potentially navigate to an error page or show a notification
    }
  }

  async loadUserAddresses(userId: string): Promise<void> {
  //   // Conceptual: fetch addresses from users/{userId}/addresses
   const addressesSnapshot =  collection(this.firestore, `users/${userId}/addresses`).withConverter(addressConverter);

 collectionData<AddressDisplayItem>(addressesSnapshot, { idField: 'id' }).subscribe(addresses  => {
    console.log(addresses)

    this.addresses.set(addresses)

 });

  // }
  }

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
      const dobForFirestore = formData.dateOfBirth
        ? (formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString().split('T')[0] : formData.dateOfBirth)
        : null;

      const profileDataToUpdate = {
        // uid: currentUser.uid, // Not needed for update, doc ID is uid
        // email: formData.email, // Email usually not updatable here
        displayName: formData.name,
        dateOfBirth: dobForFirestore,
        gender: formData.gender,
        // photoURL: currentUser.photoURL || null, // Only update if changed via a separate mechanism
        // authProviders: currentUser.providerData.map(p => p.providerId), // Usually not updated here
        isRegistrationComplete: true, // Mark registration as complete
        updatedAt: serverTimestamp(),
      };

      const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
      await setDoc(userDocRef, profileDataToUpdate, { merge: true }); // Use merge:true to update existing or create if somehow still missing

      console.log('Profile data saved to Firestore:', profileDataToUpdate);
      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      console.error('Error saving profile:', error);
      // Handle save error (e.g., show notification)
    }
  }

  onAddAddress(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.router.navigate(['/profile/add-address', currentUser.uid ]);
    } else {
      console.error("Cannot add address: no current user.");
    }
  }

  onEditAddress(addressId: string): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const userId =  currentUser.uid
      this.router.navigate(['/profile/edit-address',addressId, userId]);
    } else {
      console.error("Cannot edit address: no current user.");
    }
  }

  goBack(): void {
    if (this.isProfileCompletionMode()) {
      this.router.navigate(['/auth/sign-in']); // Or wherever new users come from before profile completion
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}