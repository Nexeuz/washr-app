// src/app/shared/components/input-field/input-field.component.ts
import { Component, Input, forwardRef, OnInit, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { SafeHtmlPipe } from '../../pipes/safehtml-pipe';


@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, SafeHtmlPipe],
  templateUrl: './input-field.html',
  styleUrls: ['./input-field.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputFieldComponent), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col min-w-40 flex-1' }
})
export class InputFieldComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() type: 'text' | 'password' | 'email' | 'date' = 'text';
  @Input() placeholder: string = '';
  @Input() trailingIconSvg?: string; // For calendar icon etc.
  @Input() validators: ValidatorFn[] = [];
  @Input() customInputClasses: string = '';



  internalControl = new FormControl<string | null | undefined>('', { validators: this.validators });
  actualInputType = signal(this.type);
  isDateWithIcon = signal(false);

  private onChange: () => void = () => { };
  private onTouched: () => void = () => { debugger; };

  constructor() {
    effect(() => {
      const currentType = this.type;
      const hasIcon = !!this.trailingIconSvg;
      this.isDateWithIcon.set(currentType === 'date' && hasIcon);
      if (this.isDateWithIcon()) {
        this.actualInputType.set(this.internalControl.value ? 'date' : 'text');
      } else {
        this.actualInputType.set(currentType);
      }
    });
  }

  ngOnInit() {
    this.internalControl.setValidators(this.validators); // Apply validators passed via @Input
    this.isDateWithIcon.set(this.type === 'date' && !!this.trailingIconSvg);
    this.actualInputType.set(this.isDateWithIcon() ? 'text' : this.type);
  }

  writeValue(value: any): void { 
    debugger;
    this.internalControl.setValue(value, { emitEvent: false }); if (this.isDateWithIcon()) { this.actualInputType.set(value ? 'date' : 'text'); } }
  registerOnChange(fn: any): void {debugger;  this.onChange = fn; }
  registerOnTouched(fn: any): void { debugger; this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { isDisabled ? this.internalControl.disable() : this.internalControl.enable(); }

  handleFocus() { if (this.isDateWithIcon()) {
     this.actualInputType.set('date');
  } else  { 
    debugger
    this.onChange() ;
    
    this.onTouched()}; }
  handleBlur() { if (this.isDateWithIcon() && !this.internalControl.value) this.actualInputType.set('text'); this.onTouched(); }

  get wrapperInputClasses(): string {
    let base = `form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#141414] bg-white h-14 placeholder:text-neutral-500 p-4 text-base font-normal leading-normal transition-all duration-150 ease-in-out shadow-sm border`; // Added transition-all

    const isInvalidAndTouched = this.internalControl.invalid && (this.internalControl.dirty || this.internalControl.touched);

    if (isInvalidAndTouched) {
      // Error state: red border and a subtle ring
      base += ` border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500`;
    } else {
      // Normal state
      base += ` border-neutral-300 focus:border-neutral-700 focus:ring-2 focus:ring-neutral-700 focus:ring-opacity-50 focus:shadow-md`;
    }

    // Adjust rounding based on whether it's part of an icon group
    if (this.isDateWithIcon()) { // Or a more generic check for leading/trailing icons
      base += ` rounded-l-lg rounded-r-none border-r-0`;
    } else {
      base += ` rounded-lg`;
    }

    return `${base} ${this.customInputClasses}`;
  }
  get wrapperDivClasses(): string { /* ... */ return this.isDateWithIcon() ? `flex w-full flex-1 items-stretch rounded-lg shadow-sm border border-neutral-300 focus-within:border-neutral-700 focus-within:ring-2 focus-within:ring-neutral-700 focus-within:ring-opacity-50 transition-shadow duration-150 ease-in-out focus-within:shadow-md` : ''; }
  get trailingIconContainerClasses(): string { /* ... */ return 'text-neutral-500 flex bg-neutral-100 items-center justify-center px-4 rounded-r-lg border-l border-neutral-300'; }
}