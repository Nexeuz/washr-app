import { Component, Input, forwardRef, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select-field.html',
  styleUrls: ['./select-field.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectFieldComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col min-w-40 flex-1' }
})
export class SelectFieldComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() options: SelectOption[] = [];
  @Input() defaultOptionText: string = 'Please select';
  @Input() validators: ValidatorFn[] = [];
  @Input() customClasses: string = '';

  internalControl = new FormControl<any>('', { validators: this.validators });

  baseSelectClasses = `form-select appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-neutral-500 border border-neutral-300 bg-white focus:border-neutral-700 focus:ring-2 focus:ring-neutral-700 focus:ring-opacity-50 h-14 p-4 text-base font-normal leading-normal transition-shadow duration-150 ease-in-out shadow-sm focus:shadow-md focus:text-[#141414]`;
  selectArrowSvg = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
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

  onBlur() {
    this.onTouched();
  }

  get combinedSelectClasses(): string {
    return `${this.baseSelectClasses} ${this.customClasses}`;
  }
}