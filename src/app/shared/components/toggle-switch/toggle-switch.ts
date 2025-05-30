// src/app/shared/components/toggle-switch/toggle-switch.component.ts
import { Component, Input, forwardRef, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './toggle-switch.html',
  styleUrls: ['./toggle-switch.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleSwitchComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSwitchComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = ''; // Optional label text displayed next to the switch
  @Input() labelPosition: 'before' | 'after' = 'before';
  @Input() validators: ValidatorFn[] = [];

  internalControl = new FormControl<boolean>(false, { validators: this.validators });
  uniqueId = `toggle-${Math.random().toString(36).substring(7)}`;

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.internalControl.setValidators(this.validators);
    this.internalControl.updateValueAndValidity();
  }

  writeValue(value: boolean): void {
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

  onToggleChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.internalControl.setValue(inputElement.checked);
    // this.onChange(inputElement.checked); // Already handled by internalControl.valueChanges.subscribe
    this.onTouched();
  }

  // Public method for the template to call on blur if needed, though change often suffices for touched state.
  handleBlur(): void {
    this.onTouched();
  }

  // Tailwind classes for the toggle switch
  switchContainerClasses = `relative inline-flex items-center cursor-pointer`;
  switchBackgroundBase = `h-[31px] w-[51px] rounded-full p-0.5 transition-colors duration-200 ease-in-out`;
  switchBackgroundUnchecked = `bg-neutral-200`; // Original: bg-[#f2f2f2]
  switchBackgroundChecked = `bg-black`; // Original: has-[:checked]:bg-black
  switchKnobBase = `block h-[27px] w-[27px] transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out`;
  // Adjusted translate for central alignment within the padding of the track
  switchKnobUnchecked = `translate-x-[0.5px]`; // Adjust if padding is exactly 0.5 on each side
  switchKnobChecked = `translate-x-[20.5px]`; // (51px width - 27px knob - 2 * 0.5px padding_offset_for_knob_start_position)
                                            // (51 - 27 - 1) = 23px total travel. If knob starts at 0.5, ends at 23.5.
                                            // More precisely: total track width - knob width - start_offset = end_offset_from_left
                                            // 51 - 27 = 24. If starts at 0.5, max translate is 24-0.5 = 23.5.
                                            // Let's use values that worked in your HTML:
                                            // Original HTML had a fixed inner div, and the parent changed alignment
                                            // Here, we translate the knob.
                                            // h-full w-[27px] rounded-full bg-white for knob
                                            // parent h-[31px] w-[51px] ... p-0.5. Knob is 27px inside 30px inner space (31 - 2*0.5).
                                            // So travel space is 30 - 27 = 3px.
                                            // Let's re-evaluate the original Tailwind `has-[:checked]:justify-end` logic from `add-vehicles.html`
                                            // The original was: <label class="... p-0.5 has-[:checked]:justify-end ..."><div class="h-full w-[27px] ..."></div></label>
                                            // This means the inner div didn't translate, its container aligned it.
                                            // For translating knob: knob starts at, say, 2px from left, ends at 51-27-2 = 22px from left.
                                            // Let's use a simpler approach for checked based on Tailwind examples:
                                            // Checked: translate-x-5 (if it's a standard size) or calculate precisely.
                                            // If track inner width is 30 (31 - 2*0.5), knob is 27. Space is 3.
                                            // Start: translate-x-0 (relative to its initial position after padding)
                                            // End: translate-x-[3px] (if knob is already positioned by flex start within the padding)
                                            // Let's stick to the common Tailwind pattern:
                                            // For a w-[51px] track and w-[27px] knob. If p-0.5 track, inner usable width for knob center is (51-1) - 27/2 = 50 - 13.5 = 36.5
                                            // This is getting too complex. The original HTML's approach was:
                                            // <label class="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-[#f2f2f2] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-black">
                                            //   <div class="h-full w-[27px] rounded-full bg-white" style="box-shadow: rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px;"></div>
                                            // </label>
                                            // The `has-[:checked]:justify-end` is key. We can't directly replicate that without custom CSS for "peer-checked" if we use a peer.
                                            // Let's use the translate method which is common with `peer`.
                                            // Standard Tailwind: track `w-11 h-6 p-1`, knob `h-4 w-4`. Checked `translate-x-5`.
                                            // Our dimensions: track `w-[51px] h-[31px] p-0.5`. Knob `w-[27px] h-[27px]`.
                                            // Knob is inside the padding. Padded track width is 51-2*0.5 = 50.
                                            // Travel distance = Padded track width - Knob width = 50 - 27 = 23px.
                                            // So, if unchecked is translate-x-0 (relative to start of padded area), checked is translate-x-[23px].
                                            // Let's assume the knob is initially flush left inside the padding.
                                            // switchKnobUnchecked = `translate-x-0`;
                                            // switchKnobChecked = `translate-x-[23px]`;
                                            // The `p-0.5` is on the outer label. The input is sr-only. The visual track is a div.
                                            // Let's simplify for the component based on typical toggle patterns.
                                            // If the track is: <div class="w-[51px] h-[31px] bg-gray-200 rounded-full p-0.5 peer-checked:bg-black transition-colors">
                                            // And knob is: <div class="w-[27px] h-[27px] bg-white rounded-full shadow-md transform transition-transform peer-checked:translate-x-[20px]"></div> (51-31 = 20px travel?) No, that's width vs height.
                                            // Travel: 51 (total width) - 27 (knob width) = 24px is total space for knob to move.
                                            // If there's padding of 0.5px on each side of the *track div for the knob*, effective track width for knob travel is (51-1) - 27 = 23.
                                            // If the knob starts at 0 (left edge of track div), it moves 23px.
                                            // Let's use the classes from your `add-vehicles.html` as a guide for styling.
                                            // The original HTML used `has-[:checked]:justify-end`.
                                            // For this component, we'll use the `peer-checked:translate-x` method.
                                            // Given `w-[51px]` for the background and `w-[27px]` for the knob,
                                            // and `p-0.5` on the background. The inner space is `51px - 2*2px` (assuming 0.5rem is 2px for p-0.5).
                                            // Tailwind's p-0.5 is 0.125rem (2px if 1rem=16px).
                                            // So inner track width = 51px - 4px = 47px.
                                            // Knob travel = 47px - 27px = 20px.
  // (51px track - 4px padding for L/R = 47px inner space. 47px - 27px knob = 20px travel)
                                              // This assumes the knob is initially positioned at the start of the inner space.
                                              // The p-0.5 on the background element means the knob sits inside that padding.
                                              // Track: w-[51px], p-0.5 (2px each side). Knob: w-[27px].
                                              // Movement space: (51 - 2*2) - 27 = 47 - 27 = 20px.
}