// --------------------------------------------------------------------------------
// 2. RadioChipGroupComponent
// Path: src/app/shared/components/radio-chip-group/radio-chip-group.component.ts
// --------------------------------------------------------------------------------
// Note: Removed aliasing for core Angular imports for consistency
import { Component as NgComponent, Input as NgInput, forwardRef as ngForwardRef, ChangeDetectionStrategy as NgChangeDetectionStrategy, OnInit as NgOnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface RadioChipOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@NgComponent({
  selector: 'app-radio-chip-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radio-chip-group.html',
  styleUrls: ['./radio-chip-group.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ngForwardRef(() => RadioChipGroupComponent),
      multi: true,
    },
  ],
  changeDetection: NgChangeDetectionStrategy.OnPush,
})
export class RadioChipGroupComponent implements ControlValueAccessor, NgOnInit {

  @NgInput() label: string = ''; // Optional label for the group
  @NgInput() options: RadioChipOption[] = [];
  @NgInput() name: string = `radio-group-${Math.random().toString(36).substring(7)}`; // Unique name for the radio group
  @NgInput() validators: ValidatorFn[] = [];
  @NgInput() chipLayoutClasses: string = 'flex flex-wrap gap-3 py-2'; // Default layout for chips

  internalControl = new FormControl<any>('', { validators: this.validators });

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.internalControl.setValidators(this.validators);
    this.internalControl.updateValueAndValidity();
  }

  writeValue(value: any): void {
    this.internalControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.internalControl.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.internalControl.disable() : this.internalControl.enable();
  }

  // You need a method that the template can call, which in turn calls this.onTouched()
  handleBlur(): void {
    this.onTouched(); // Call the registered onTouched function
  }

  onChipChange(value: any) {
    this.internalControl.setValue(value); // This will trigger registerOnChange
    this.onTouched(); // Mark as touched on change
  }

  // Base classes for each chip label
  chipLabelBaseClasses = `text-sm font-medium leading-normal flex items-center justify-center rounded-full border px-5 py-2.5 h-11 cursor-pointer transition-all duration-150 ease-in-out shadow-sm`;
  // Classes for unselected chip
  chipLabelUnselectedClasses = `border-neutral-300 text-[#141414] bg-white hover:border-neutral-500`;
  // Classes for selected chip
  chipLabelSelectedClasses = `border-black bg-black text-white shadow-md`;
}
