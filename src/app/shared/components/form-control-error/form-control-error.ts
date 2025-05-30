import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

interface ErrorMessageMap {
  [key: string]: (errorValue?: any) => string;
}

@Component({
  selector: 'app-form-control-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-control-error.html',
  styleUrls: ['./form-control-error.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormControlErrorComponent implements OnChanges, OnInit {
  @Input() control: AbstractControl | null = null;
  @Input() controlName: string = 'This field'; // Default name for messages
    private statusChangesSubscription?: Subscription;


  constructor(private cd: ChangeDetectorRef) {

  }

  errorMessages: string[] = [];

  // Customizable mapping of error keys to user-friendly messages
  // This can be expanded or even provided as an Input if more flexibility is needed.
  private readonly defaultErrorMessages: ErrorMessageMap = {
    required: () => `${this.controlName} is required.`,
    email: () => `Please enter a valid email address.`,
    minlength: (errorValue) => `${this.controlName} must be at least ${errorValue.requiredLength} characters long.`,
    maxlength: (errorValue) => `${this.controlName} cannot exceed ${errorValue.requiredLength} characters.`,
    pattern: (errorValue) => `${this.controlName} format is invalid. (Pattern: ${errorValue.requiredPattern})`,
    passwordsNotMatching: () => `Passwords do not match.`,
    // Add more common validators here
    min: (errorValue) => `${this.controlName} must be at least ${errorValue.min}.`,
    max: (errorValue) => `${this.controlName} cannot be more than ${errorValue.max}.`,
    // Example for a custom validator
    // uniqueUsername: () => `This username is already taken.`
  };

  ngOnInit(): void {


    this.control!.statusChanges.subscribe((value) => {
      console.log(value)
      debugger
      this.cd.markForCheck();
      this.updateErrorMessages();
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
     if (changes['control']) {
      this.unsubscribeFromStatusChanges(); // Unsubscribe from old control if any
      if (this.control) {
        this.updateErrorMessages(); // Initial check
        // Subscribe to status changes to update errors dynamically
        this.statusChangesSubscription = this.control.statusChanges.subscribe(() => {
          this.updateErrorMessages();
                    this.cd.markForCheck(); // Explicitly mark for change detection
        });
      } else {
        // Control was removed or set to null
        this.errorMessages = [];
       this.cd.markForCheck(); // Also mark for check if errors are cleared
      }
    }
  }

    ngOnDestroy(): void {
    this.unsubscribeFromStatusChanges();
  }

  private unsubscribeFromStatusChanges(): void {
    if (this.statusChangesSubscription) {
      this.statusChangesSubscription.unsubscribe();
      this.statusChangesSubscription = undefined;
    }
  }

  private updateErrorMessages(): void {
    this.errorMessages = [];
    console.log(this.control?.errors);
    console.log('pristine', this.control?.pristine);
        console.log(this.control?.untouched);
  
    if (this.control && this.control.errors && !this.control.pristine) {
      const errors: ValidationErrors = this.control.errors;
      for (const errorKey in errors) {
        if (errors.hasOwnProperty(errorKey)) {
          const messageFn = this.defaultErrorMessages[errorKey];
          if (messageFn) {
            this.errorMessages.push(messageFn(errors[errorKey]));
          } else {
            // Fallback for unknown error keys
            this.errorMessages.push(`${this.controlName} has an error: ${errorKey}.`);
          }
        }
      }
    }
  }
}