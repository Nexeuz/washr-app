import { Component, OnInit, ChangeDetectionStrategy, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface AddressFormData { addressId?: string; }
interface AddressFormControls {
  addressLabel: FormControl<string | null>;
  address: FormControl<string | null>;
  addressIcon: FormControl<string | null>;
}

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatRadioModule, MatButtonModule, MatIconModule
  ],
  templateUrl: './address-form.html',
  styleUrls: ['./address-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  addressForm!: FormGroup<AddressFormControls>;
  isEditMode: boolean = false;
  pageTitle: string = 'Add Address';

  addressIconOptions: { value: string, label: string, iconName: string }[] = [
    { value: 'home', label: 'House', iconName: 'home' },
    { value: 'work', label: 'Briefcase', iconName: 'work' },
    { value: 'location_pin', label: 'Map Pin', iconName: 'location_on' },
  ];

  constructor(
    private bottomSheetRef: MatBottomSheetRef<AddressFormComponent, any>, // Result type can be defined
    @Inject(MAT_BOTTOM_SHEET_DATA) public data?: AddressFormData
  ) {
    this.addressForm = this.fb.group({
      addressLabel: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressIcon: new FormControl('home', Validators.required)
    });

    if (data && data.addressId) {
      this.isEditMode = true;
      this.pageTitle = 'Edit Address';
      // In a real app, load data for this.data.addressId and patch form
      // this.loadAddressData(this.data.addressId);
    }
  }

  ngOnInit(): void { /* If not loading data in constructor */ }

  // loadAddressData(id: string) { /* Fetch and patch form */ }

  onSave(): void {
    if (this.addressForm.valid) {
      this.bottomSheetRef.dismiss(this.addressForm.value); // Pass form value back
    } else {
      this.addressForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.bottomSheetRef.dismiss();
  }
}