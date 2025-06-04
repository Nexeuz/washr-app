import { Component, OnInit, ChangeDetectionStrategy, inject, Inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Firestore (for fetching address data in edit mode) - conceptual
import { Firestore, FirestoreModule, doc, getDoc } from '@angular/fire/firestore';
// import { UserDataService } from '../../../core/services/user-data.service'; // Or your data service

// Data passed to the bottom sheet
export interface AddressFormData {
  addressId?: string; // For editing an existing address
  userId?: string; // Needed if addresses are in a subcollection and you need the current user's ID
  // You can pass other initial data if needed
}

// Typed Form Interface
interface AddressFormControls {
  addressLabel: FormControl<string | null>;
  address: FormControl<string | null>;
  addressIcon: FormControl<string | null>; // e.g., 'home', 'work', 'location_on'
}

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    FirestoreModule
  ],
  templateUrl: './address-form.html',
  styleUrls: ['./address-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressFormComponent implements OnInit {
  @HostBinding('class.address-form-host') hostClass = true;

  private fb = inject(FormBuilder);
  private firestore = inject(Firestore); // Inject Firestore
  // private userDataService = inject(UserDataService); // Alternative: inject your data service

  addressForm!: FormGroup<AddressFormControls>;
  isEditMode: boolean = false;
  sheetTitle: string = 'Add Address';

  addressIconOptions: { value: string, label: string, iconName: string }[] = [
    { value: 'home', label: 'House', iconName: 'home' },
    { value: 'work', label: 'Briefcase', iconName: 'work' },
    { value: 'location_pin', label: 'Map Pin', iconName: 'location_on' },
  ];

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddressFormComponent, any>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data?: AddressFormData
  ) {
    this.addressForm = this.fb.group({
      addressLabel: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressIcon: new FormControl('home', Validators.required)
    });

    if (data && data.addressId) {
      this.isEditMode = true;
      this.sheetTitle = 'Edit Address';
      if (data.userId) { // Ensure userId is passed if needed for subcollection path
        this.loadAddressData(data.userId, data.addressId);
      } else {
        console.error("User ID is missing, cannot load address for editing.");
        // Optionally close the sheet or show an error
        // this.bottomSheetRef.dismiss();
      }
    }
  }

  ngOnInit(): void {
    // Initialization logic if needed
  }

  async loadAddressData(userId: string, addressId: string): Promise<void> {
    console.log(`Loading address data for userId: ${userId}, addressId: ${addressId}`);
    // Path to the specific address document in the subcollection
    const addressDocRef = doc(this.firestore, `users/${userId}/addresses/${addressId}`);
    try {
      const docSnap = await getDoc(addressDocRef);
      if (docSnap.exists()) {
        const addressData = docSnap.data();
        console.log("Fetched address data:", addressData);
        this.addressForm.patchValue({
          addressLabel: addressData['label'] || '', // Map Firestore field 'label' to 'addressLabel'
          address: addressData['fullAddress'] || '', // Map 'fullAddress' to 'address'
          addressIcon: addressData['iconKey'] || 'home' // Map 'iconKey' to 'addressIcon'
        });
      } else {
        console.warn(`Address document with ID ${addressId} does not exist for user ${userId}.`);
        // Handle case where address is not found (e.g., show message, close sheet)
        this.bottomSheetRef.dismiss(); // Close sheet if address not found
      }
    } catch (error) {
      console.error("Error fetching address document:", error);
      // Handle error (e.g., show message, close sheet)
      this.bottomSheetRef.dismiss();
    }

    // --- OR if using a UserDataService ---
    // this.userDataService.getAddressById(userId, addressId).subscribe(addressData => {
    //   if (addressData) {
    //     this.addressForm.patchValue({
    //       addressLabel: addressData.label,
    //       address: addressData.fullAddress,
    //       addressIcon: addressData.iconKey
    //     });
    //   } else {
    //     console.warn(`Address with ID ${addressId} not found.`);
    //     this.bottomSheetRef.dismiss();
    //   }
    // });
  }

  onSave(): void {
    this.addressForm.markAllAsTouched();
    if (this.addressForm.valid) {
      const formData = this.addressForm.value;
      const resultData = {
        ...formData,
        // Map form control names back to Firestore field names if they differ
        label: formData.addressLabel,
        fullAddress: formData.address,
        iconKey: formData.addressIcon,
      };
      // Remove the form-specific names if they are not in your Firestore model for address
      delete resultData.addressLabel; 
      // delete resultData.address; // fullAddress is likely what you store
      // delete resultData.addressIcon; // iconKey is likely what you store

      console.log("Saving/Updating address with data:", resultData);
      this.bottomSheetRef.dismiss(resultData); // Pass the prepared data back
    } else {
      console.log('Address form is invalid.');
    }
  }

  onCancel(): void {
    this.bottomSheetRef.dismiss(); // Dismiss without a result
  }
}