// =================================================================================
// features/user-profile/edit-address-page/address-form.component.ts
// Path: src/app/features/user-profile/edit-address-page/address-form.component.ts
// =================================================================================
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

// Firestore (for fetching address data in edit mode)
import {  addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
// import { UserDataService } from '../../../core/services/user-data.service'; // Or your data service

// Data passed to the bottom sheet from EditAddressPageComponent
export interface AddressFormData {
  addressId?: string; // For editing an existing address
  userId?: string;    // Current user's ID, needed to construct Firestore path
}

// Typed Form Interface
interface AddressFormControls {
  addressLabel: FormControl<string | null>;
  address: FormControl<string | null>;
  addressIcon: FormControl<string | null>;
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
  ],
  templateUrl: './address-form.html',
  styleUrls: ['./address-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressFormComponent implements OnInit {
  @HostBinding('class.address-form-host') hostClass = true;

  private fb = inject(FormBuilder);
  private firestore = inject(Firestore);
  // private userDataService = inject(UserDataService); // Alternative for data fetching

  addressForm!: FormGroup<AddressFormControls>;
  isEditMode: boolean = false;
  sheetTitle: string = 'Add Address';

  addressIconOptions: { value: string, label: string, iconName: string }[] = [
    { value: 'home', label: 'Casa', iconName: 'home' },
    { value: 'work', label: 'Trabajo', iconName: 'work' },
    { value: 'school', label: 'Estudio', iconName: 'school' },
    { value: 'location_on', label: 'Otro', iconName: 'location_on' },
  ];

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddressFormComponent, any>, // Second generic type is for the result when closed
    @Inject(MAT_BOTTOM_SHEET_DATA) public data?: AddressFormData // Data injected from EditAddressPageComponent
  ) {
    this.addressForm = this.fb.group({
      addressLabel: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressIcon: new FormControl('home', Validators.required) // Default icon
    });

    // Check if data for editing is passed
    if (this.data && this.data.addressId && this.data.userId) {
      this.isEditMode = true;
      this.sheetTitle = 'Edit Address';
      // Load the existing address data into the form
      this.loadAddressData(this.data.userId, this.data.addressId);
    } else {
      this.isEditMode = false;
      this.sheetTitle = 'Add Address';
    }
  }

  ngOnInit(): void {
    // Further initialization if needed
  }

  async loadAddressData(userId: string, addressId?: string): Promise<void> {
    console.log(`AddressFormComponent: Loading address data for userId: ${userId}, addressId: ${addressId}`);

    if (userId && addressId) {
    const addressDocRef = doc(this.firestore, `users/${userId}/addresses/${addressId}`);
      try {
        const docSnap = await getDoc(addressDocRef);
        if (docSnap.exists()) {
          const addressData = docSnap.data();
          console.log("AddressFormComponent: Fetched address data:", addressData);
          // Patch the form with the loaded data
          // Ensure the keys in patchValue match your Firestore document field names
          this.addressForm.patchValue({
            addressLabel: addressData['label'] || '',       // Maps Firestore 'label' to form 'addressLabel'
            address: addressData['fullAddress'] || '', // Maps Firestore 'fullAddress' to form 'address'
            addressIcon: addressData['iconKey'] || 'home'  // Maps Firestore 'iconKey' to form 'addressIcon'
          });
        } else {
          console.warn(`AddressFormComponent: Address document with ID ${addressId} does not exist for user ${userId}.`);
          this.bottomSheetRef.dismiss(); // Close sheet if address not found
        }
      } catch (error) {
        console.error("AddressFormComponent: Error fetching address document:", error);
        this.bottomSheetRef.dismiss(); // Close sheet on error
      }   
    } else {

    }
   
  }

  onSave(): void {
    this.addressForm.markAllAsTouched();
    if (this.addressForm.valid) {
      const formData = this.addressForm.value;
      // Prepare data to be sent back to EditAddressPageComponent (or whoever opened the sheet)
      // Map form control names to your Firestore field names if they differ
      const resultData = {
        label: formData.addressLabel,
        fullAddress: formData.address,
        iconKey: formData.addressIcon,
        // Include other fields if your form has them and your Firestore model expects them
      };

      console.log("AddressFormComponent: Saving/Updating address with data:", resultData);
      this.bottomSheetRef.dismiss(resultData); // Pass the prepared data back
    } else {
      console.log('AddressFormComponent: Address form is invalid.');
    }
  }

  onCancel(): void {
    this.bottomSheetRef.dismiss(); // Dismiss without a result, indicating cancellation
  }
}