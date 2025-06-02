import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Styling applied to the host element <app-page-header>
    // These classes make the header sticky, give it a background, and a bottom border.
    class: 'block w-full sticky top-0 z-20 page-header-container', // z-20 to be above most content
  }
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() showBackButton: boolean = true;
  // Default Material Icon font name for the back button (left arrow)
  @Input() backButtonIconName: string = 'arrow_back';
  @Input() backButtonAriaLabel: string = 'Back';

  // Optional: Slot for actions on the right
  @Input() showActionsSlot: boolean = false;

  @Output() backButtonClick = new EventEmitter<void>();

  onBackClicked(): void {
    this.backButtonClick.emit();
  }
}