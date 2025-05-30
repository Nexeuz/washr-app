// --------------------------------------------------------------------------------
// 1. PageHeaderComponent
// Path: src/app/shared/components/page-header/page-header.component.ts
// --------------------------------------------------------------------------------
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // For @if
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full sticky top-0 z-10 bg-neutral-50 border-b border-neutral-200', // Default styling for the header container
  }
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() showBackButton: boolean = true;
  @Input() backButtonSvg: string = `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path></svg>`;
  @Input() backButtonAriaLabel: string = 'Back';

  @Output() backButtonClick = new EventEmitter<void>();

  onBackClicked(): void {
    this.backButtonClick.emit();
  }
}