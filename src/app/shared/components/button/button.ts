// src/app/shared/components/button/button.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // For @if
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() text: string = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() styleType: 'primary' | 'secondary' | 'social' | 'custom' = 'primary';
  @Input() fullWidth: boolean = false;
  @Input() disabled: boolean = false;
  @Input() leadingIconSvg?: string;
  @Input() customClasses: string = '';
  @Output() btnClick = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent) { if (!this.disabled) this.btnClick.emit(event); }

  get computedButtonClasses(): string {
    let base = `flex items-center justify-center overflow-hidden transition-all duration-150 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-opacity-50 rounded-lg min-w-[84px] leading-normal tracking-[0.015em]`;
    if (this.fullWidth) base += ` w-full`;
    if (this.disabled) base += ` opacity-50 cursor-not-allowed`;
    switch (this.styleType) {
      case 'primary': base += ` h-12 px-5 bg-black hover:bg-neutral-800 text-neutral-50 text-base font-bold shadow-md hover:shadow-lg focus:ring-neutral-700 ${this.disabled ? '' : 'hover:scale-[1.02]'}`; break;
      case 'secondary': base += ` h-11 px-4 bg-neutral-200 hover:bg-neutral-300 text-[#141414] text-sm font-semibold shadow-sm hover:shadow-md focus:ring-neutral-400 ${this.disabled ? '' : 'hover:scale-[1.02]'}`; break;
      case 'social': base += ` h-12 px-5 bg-white hover:bg-neutral-100 text-[#141414] border border-neutral-300 text-base font-semibold shadow-sm hover:shadow-md focus:ring-neutral-400 ${this.disabled ? '' : 'hover:scale-[1.02]'}`; break;
    }
    return `${base} ${this.customClasses}`;
  }
}