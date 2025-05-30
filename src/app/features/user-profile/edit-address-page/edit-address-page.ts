// Path: src/app/features/user-profile/edit-address-page/edit-address-page.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router'; // ActivatedRoute to get route params
import { Subscription } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button';
import { InputFieldComponent } from '../../../shared/components/input-field/input-field';
import { RadioChipGroupComponent, RadioChipOption } from '../../../shared/components/radio-chip-group/radio-chip-group';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet/bottom-sheet';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';

// Shared Components

// import { IconComponent } from '../../../shared/components/icon/icon.component'; // Only if directly used in this template

// Models (assuming these are defined in shared/models/)
// import { Address } from '../../../shared/models/address.model';
// import { UserDataService } from '../../../core/services/user-data.service'; // Example service

// Define a typed interface for the address form
interface AddressForm {
  addressLabel: FormControl<string | null>;
  address: FormControl<string | null>;
  addressIcon: FormControl<string | null>; // Value could be an identifier like 'house', 'briefcase'
}

@Component({
  selector: 'app-edit-address-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    InputFieldComponent,
    RadioChipGroupComponent,
    BottomSheetComponent,
    PageHeaderComponent
    ,
    // IconComponent // Only if directly used in this template
  ],
  templateUrl: './edit-address-page.html',
  styleUrls: ['./edit-address-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAddressPageComponent implements OnInit, OnDestroy {
  // Using inject() for cleaner dependency injection in constructor-less classes or for preference
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  // private userDataService = inject(UserDataService); // Example for data operations

  addressForm!: FormGroup<AddressForm>;
  isEditMode = signal(false);
  editingAddressId = signal<string | null>(null);
  pageTitle = signal('Add Address'); // Dynamic title for the page header

  // This signal controls the bottom sheet directly on this page
  isAddressSheetOpen = signal(false); // Start closed, open in ngOnInit

  private routeSub?: Subscription;

  // Example icon options for the address form.
  // In a real app, the 'value' would likely be a stable identifier (e.g., 'house', 'work', 'pin').
  // The actual SVG could be mapped from this identifier in the app-icon component or elsewhere.
  addressIconOptions: RadioChipOption[] = [
    { label: 'House', value: 'house' },
    { label: 'Briefcase', value: 'briefcase' },
    { label: 'MapPin', value: 'mappin' },
  ];

  constructor() {
    this.addressForm = this.fb.group({
      addressLabel: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      addressIcon: new FormControl('house', Validators.required) // Default icon value
    });
  }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id'); // Check for an 'id' parameter in the route
      if (id) {
        this.isEditMode.set(true);
        this.editingAddressId.set(id);
        this.pageTitle.set('Edit Address');
        this.loadAddressData(id); // Fetch and populate form for editing
      } else {
        this.isEditMode.set(false);
        this.editingAddressId.set(null);
        this.pageTitle.set('Add Address');
        this.addressForm.reset({ addressIcon: 'house' }); // Default for new address
      }
      // Open the bottom sheet as soon as the page/parameters are processed
      this.isAddressSheetOpen.set(true);
    });
  }

  loadAddressData(id: string): void {
    console.log('Attempting to load address data for ID:', id);
    // In a real application, you would fetch this data from a service:
    // this.userDataService.getAddressById(id).subscribe(addressData => {
    //   if (addressData) {
    //     this.addressForm.patchValue({
    //       addressLabel: addressData.label,
    //       address: addressData.fullStreetAddress,
    //       addressIcon: addressData.iconIdentifier // e.g., 'house', 'briefcase'
    //     });
    //   } else {
    //     // Address not found, handle appropriately (e.g., show error, navigate back)
    //     console.error('Address not found for ID:', id);
    //     this.closeSheetAndNavigateBack();
    //   }
    // });

    // For demonstration purposes, using mock data:
    if (id === "mock-edit-id-123") { // Example ID
        this.addressForm.patchValue({
            addressLabel: 'My Work Office',
            address: '456 Business Rd, Anytown',
            addressIcon: 'briefcase'
        });
    } else {
        // If ID doesn't match mock, treat as if not found or reset for safety
        console.warn(`No mock data for address ID: ${id}. Resetting form.`);
        this.addressForm.reset({ addressIcon: 'house' });
        // Potentially navigate back if an ID was expected but no data found
        // this.closeSheetAndNavigateBack();
    }
  }

  onSaveAddress(): void {
    if (this.addressForm.valid) {
      const formData = this.addressForm.value;
      console.log('Address Form Data to be saved:', formData);

      if (this.isEditMode() && this.editingAddressId()) {
        console.log('Updating address with ID:', this.editingAddressId());
        // Example: this.userDataService.updateAddress(this.editingAddressId(), formData).subscribe({
        //   next: () => this.closeSheetAndNavigateBack(),
        //   error: (err) => console.error('Error updating address', err)
        // });
      } else {
        console.log('Adding new address');
        // Example: this.userDataService.addAddress(formData).subscribe({
        //   next: () => this.closeSheetAndNavigateBack(),
        //   error: (err) => console.error('Error adding address', err)
        // });
      }
      this.closeSheetAndNavigateBack(); // For demo, close immediately
    } else {
      this.addressForm.markAllAsTouched(); // Show validation errors
      console.log('Address form is invalid');
    }
  }

  // This method is called when the BottomSheetComponent emits `closeSheet`
  // or when we want to programmatically close and navigate.
  closeSheetAndNavigateBack(): void {
    this.isAddressSheetOpen.set(false);
    // Navigate back to the personal-info page (or previous page)
    // A slight delay can be good if the sheet has an animation.
    setTimeout(() => {
      this.router.navigate(['/profile/personal-info']); // Or use Angular's Location.back()
    }, 300); // Adjust delay to match animation if any
  }

  // This is for the PageHeader's back button
  handleHeaderBackClick(): void {
    this.closeSheetAndNavigateBack();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}