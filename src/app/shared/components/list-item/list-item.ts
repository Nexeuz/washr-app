// src/app/shared/components/list-item/list-item.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // For @if
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-list-item',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './list-item.html',
  styleUrls: ['./list-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full', // Make the component take full width by default
  }
})
export class ListItemComponent {
  @Input() iconSvg?: string; // SVG string for the main icon on the left
  @Input() iconBackgroundClass: string = 'bg-neutral-100'; // Background for the icon container
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() showTrailingIcon: boolean = true; // Whether to show the trailing navigation icon
  @Input() trailingIconSvg: string = `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg>`; // Default caret right
  @Input() isClickable: boolean = true; // If the item should have hover effects and emit click

  @Output() itemClick = new EventEmitter<void>();

  onItemClicked(): void {
    if (this.isClickable) {
      this.itemClick.emit();
    }
  }

  get hostClasses(): string {
    let classes = 'flex items-center gap-4 bg-white p-4 rounded-lg shadow-md min-h-[72px] justify-between w-full';
    if (this.isClickable) {
      classes += ' hover:shadow-lg transition-shadow duration-150 ease-in-out cursor-pointer';
    }
    return classes;
  }

  get iconContainerClasses(): string {
    return `text-[#141414] flex items-center justify-center rounded-full shrink-0 size-12 ${this.iconBackgroundClass}`;
  }
}