import { Component, ChangeDetectionStrategy, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Data that can be passed to the confirmation dialog
export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationDialogComponent {
  // Use constructor injection for MAT_DIALOG_DATA
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    // Set default button text if not provided
    this.data.confirmButtonText = this.data.confirmButtonText || 'Delete';
    this.data.cancelButtonText = this.data.cancelButtonText || 'Cancel';
  }

  onConfirm(): void {
    // When the user clicks the confirm button, close the dialog and pass back `true`
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    // When the user clicks the dismiss button or clicks outside, close and pass back `false`
    this.dialogRef.close(false);
  }
}