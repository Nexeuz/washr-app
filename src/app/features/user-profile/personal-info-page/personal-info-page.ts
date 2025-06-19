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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';


// Shared Components
import { MatSnackBar } from '@angular/material/snack-bar';


// Services
// Firestore
import { doc, getDoc, setDoc, serverTimestamp, DocumentData, getDocFromCache, Timestamp, collection, FirestoreDataConverter, QueryDocumentSnapshot, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { collectionData, Firestore } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';

import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { ListItemComponent } from '../../../shared/components/list-item/list-item';
import { AuthService } from '../../../core/services/auth';
import { provideNativeDateAdapter } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { AddressFormComponent } from '../address-form/address-form';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { LoadingService } from '../../../core/services/loading.service';

// Typed Form Interface (No password fields)
interface PersonalInfoForm {
  name: FormControl<string | null>;
  dateOfBirth: FormControl<Date | null>;
  email: FormControl<string | null>;
  gender: FormControl<'male' | 'female' | null>;
  phone: FormControl<string | null>;
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
    MatBottomSheetModule
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
  private _snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private bottomSheet = inject(MatBottomSheet);
  private loadingService = inject(LoadingService); // Assuming you have a loading service for UI feedback


  // 1. Create a Subject to signal component destruction
  private destroy$ = new Subject<void>();

  personalInfoForm!: FormGroup<PersonalInfoForm>;
  // This signal indicates if the page is for initial profile completion vs. editing
  isProfileCompletionMode = signal(false);

  private currentUser: User | null = this.authService.getCurrentUser();


  addresses = signal<AddressDisplayItem[]>([]);

  genderOptions: GenderOption[] = [
    { value: 'male', viewValue: 'Masculino' },
    { value: 'female', viewValue: 'Femenino' },
  ];


  constructor() { }

  ngOnInit(): void {
    this.initializeForm();

    this.authService.authState$.subscribe(user => {
      if (user) {
        this.checkLoginStatus();
        // Ensure user document exists in Firestore and load data
        this.checkAndLoadUserProfile(user);
      }

    })


  }

  async ngOnDestroy() {

    const userDocRef = doc(this.firestore, `users/${this.currentUser?.uid}`);
    let docSnap;



    // Try loading from cache first (optional)
    try {
      docSnap = await getDocFromCache(userDocRef);
      console.log('📦 Loaded profile from cache');
    } catch (cacheError) {
      console.warn('⚠️ No cache found. Loading from server...');
      docSnap = await getDoc(userDocRef);
    }

    const userProfileData = docSnap.data();
    if (userProfileData && userProfileData['isRegistrationComplete']) {
      this.onSaveFirestore(false, userProfileData['isRegistrationComplete']);

    } else {
      this.onSaveFirestore();

    }

    this.destroy$.next();
    this.destroy$.complete();
  }


  initializeForm(): void {
    this.personalInfoForm = this.fb.group({
      name: new FormControl('', Validators.required),
      dateOfBirth: new FormControl<Date | null>(null, Validators.required),
      email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]), // Email usually pre-filled and disabled
      phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
      gender: new FormControl<'male' | 'female' | null>(null),
    });
  }

  async checkAndLoadUserProfile(currentUser: User): Promise<void> {
    this.loadingService.showLoading(); // Show loading spinner


    this.currentUser = currentUser;

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
          this.router.navigateByUrl('/dashboard')
          console.log(`PersonalInfoPage: Profile for user ${currentUser.uid} is complete. Editing mode.`);
        }
      }

      // Patch form with data
      if (userProfileData) {
        this.personalInfoForm.patchValue({
          name: userProfileData['displayName'] || currentUser.displayName || '',
          email: userProfileData['email'] || currentUser.email || '',
          phone: userProfileData['phone'] || '',
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
    } finally {
      this.loadingService.hideLoading(); // Hide loading spinner
    }
  }

  async loadUserAddresses(userId: string): Promise<void> {
    this.loadingService.showLoading(); // Show loading spinner
    //   // Conceptual: fetch addresses from users/{userId}/addresses
    const addressesSnapshot = collection(this.firestore, `users/${userId}/addresses`).withConverter(addressConverter);

    const addresses$ = collectionData<AddressDisplayItem>(addressesSnapshot, { idField: 'id' });


    addresses$.pipe(
      takeUntil(this.destroy$) // This will automatically unsubscribe when destroy$ emits
    ).subscribe({
      next: (addresses) => {
        console.log('Fetched addresses:', addresses);
        this.addresses.set(addresses);
      },
      error: (error) => {
        console.error("Error fetching addresses:", error);
        this._snackBar.open('No se pudieron cargar las direcciones.', 'Cerrar', { duration: 3000 });
      },
      complete: () => {
        this.loadingService.hideLoading(); // Hide loading spinner when done
      }
    });


    // }
  }

  async onSave(): Promise<void> {
    this.personalInfoForm.markAllAsTouched();
    if (this.personalInfoForm.invalid) {
      console.log('Personal Info Form is invalid. Please check the fields.');
      return;
    }

    if (this.addresses().length == 0) {
      this._snackBar.open('Debes añadir al menos una dirección', 'Ok');
      return;
    }


    this.onSaveFirestore(true, true);

  }


  async onSaveFirestore(onNavigatedashboard = false, isProfileCompletionMode = false): Promise<void> {
    this.loadingService.showLoading(); // Show loading spinner

    const formData = this.personalInfoForm.getRawValue(); // Use getRawValue for all fields, including disabled email

    this.checkLoginStatus();

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
        phone: formData.phone,
        // photoURL: currentUser.photoURL || null, // Only update if changed via a separate mechanism
        isRegistrationComplete: isProfileCompletionMode, // Mark registration as complete
        updatedAt: serverTimestamp(),
      };

      if (this.currentUser) {
        const userDocRef = doc(this.firestore, `users/${this.currentUser?.uid}`);
        await setDoc(userDocRef, profileDataToUpdate, { merge: true }); // Use merge:true to update existing or create if somehow still missing  
      }



      if (onNavigatedashboard) {
        console.log('Profile data saved to Firestore:', profileDataToUpdate);
        this.router.navigate(['/auth/vehicles']);
      }
      this._snackBar.open('Error al guardar el perfil. Por favor, inténtelo de nuevo.', 'Cerrar', { duration: 3000 });

    } catch (error: any) {
      console.error('Error saving profile:', error);
      this._snackBar.open('Error al guardar el perfil. Por favor, inténtelo de nuevo.', 'Cerrar', { duration: 3000 });
      // Handle save error (e.g., show notification)
    } finally {
      this.loadingService.hideLoading(); // Hide loading spinner
    }
  }


  // 3. Implement ngOnDestroy to complete the Subject

  onAddAddress(): void {

    if (this.currentUser) {
      this.openAddressForm(this.currentUser.uid);
    }
  }

  onEditAddress(addressId: string): void {

    if (this.currentUser) {
      this.openAddressForm(this.currentUser.uid, addressId);
    }
  }


  openAddressForm(userId: string, addressId?: string): void {
    if (userId) {
      const bottomSheetRef = this.bottomSheet.open(AddressFormComponent, {
        data: { userId: userId, addressId },
        disableClose: true,
        panelClass: 'custom-bottom-sheet-container' // Optional: for global styling of the sheet container
      });

      bottomSheetRef.afterDismissed().subscribe(async result => {
        this.loadingService.showLoading(); // Show loading spinner
        console.log('Address form sheet dismissed. Result:', result);
        try {
          this.loadingService.showLoading(); // Show loading spinner

          if (result) {
            if (addressId) {
              const addressDocRef = doc(this.firestore, `users/${userId}/addresses/${addressId}`);
              await updateDoc(addressDocRef, result);
              console.log('Document updated with ID:', addressId);
            } else {
              const usersColRef = collection(this.firestore, `users/${userId}/addresses`); // 'users' collection
              const newDocRef = await addDoc(usersColRef, {
                ...result,
                createdAt: serverTimestamp(),
              });
              console.log('Document added with ID:', newDocRef.id);

            }
          }



        } catch (error) {
          console.error('Error adding document:', error);
        } finally {
          this.loadingService.hideLoading(); // Hide loading spinner
        }
      });
    } else {
      console.error("Cannot edit address: no current user.");
    }
  }
  onDeleteAddress(addressId: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Eliminar Dirección',
        message: '¿Está seguro de que desea eliminar permanentemente esta dirección?',
        confirmButtonText: 'Eliminar'
      } as ConfirmationDialogData,
      width: '320px',
    });

    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if (!result) return;
      try {
        this.loadingService.showLoading(); // Show loading spinner
        this.checkLoginStatus();
        if (this.currentUser) {
          const addressDocRef = doc(this.firestore, `users/${this.currentUser.uid}/addresses/${addressId}`);
          await deleteDoc(addressDocRef);
          this._snackBar.open('Dirección eliminada exitosamente.', 'Cerrar', { duration: 2000 });
        }

        // The real-time subscription from `loadUserAddresses` will automatically update the UI.
      } catch (error) {
        console.error("Error deleting address:", error);
        this._snackBar.open('Error al eliminar la dirección. Por favor, inténtelo de nuevo.', 'Cerrar', { duration: 3000 });
      } finally {
        this.loadingService.hideLoading(); // Hide loading spinner
      }
    });
  }

  goBack(): void {
    if (this.isProfileCompletionMode()) {
      this.router.navigate(['/auth/sign-in']); // Or wherever new users come from before profile completion
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  checkLoginStatus() {

    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this._snackBar.open('Sesión expirada. Por favor, inicie sesión de nuevo.', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/auth/login']);
      throw Error('Session no valida')
    }

  }
}