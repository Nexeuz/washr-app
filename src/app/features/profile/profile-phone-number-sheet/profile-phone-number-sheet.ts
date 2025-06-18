import { Component, ChangeDetectionStrategy, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

// Data that can be passed to this bottom sheet
export interface PhoneNumberSheetData {
  currentPhoneNumber: string | null;
}

@Component({
  selector: 'app-profile-phone-number-sheet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './profile-phone-number-sheet.html',
  styleUrls: ['./profile-phone-number-sheet.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePhoneNumberSheetComponent {
  private fb = inject(FormBuilder);
  public phoneForm: FormGroup;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<ProfilePhoneNumberSheetComponent, string>, // Second generic type is for the result when closed
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: PhoneNumberSheetData
  ) {
    this.phoneForm = this.fb.group({
      phone: new FormControl(this.data.currentPhoneNumber || '', [
        Validators.required,
        Validators.pattern("^[0-9]*$") // Simple pattern for numbers only
      ])
    });
  }

  onSaveClick(): void {
    if (this.phoneForm.valid) {
      // When the user clicks save, close the dialog and pass back the new phone number
      this._bottomSheetRef.dismiss(this.phoneForm.value.phone);
    } else {
      this.phoneForm.markAllAsTouched();
    }
  }

  onCancelClick(event: MouseEvent): void {
    this._bottomSheetRef.dismiss(); // Dismiss without a result to indicate cancellation
    event.preventDefault(); // Prevent default button action
  }
}