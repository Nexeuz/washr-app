import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-list-item',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatDividerModule,MatButtonModule, MatIconModule],
  templateUrl: './list-item.html',
  styleUrls: ['./list-item.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListItemComponent {
  @Input() iconName?: string; // For Material Icon font key (e.g., 'home', 'work')
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() isClickable: boolean = true;
  @Input() showDivider: boolean = false; // Control divider visibility from parent

  // Inputs for trailing icons
  @Input() showTrailingIcon: boolean = true; // For navigation (e.g., chevron)
  @Input() trailingIconName: string = 'chevron_right';
  @Input() showDeleteButton: boolean = true; // To show the delete button
  @Input() deleteIconName: string = 'delete_outline'; // Material Icon for delete

// Outputs
  @Output() itemClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>(); // Emits when delete button is 

  onItemClicked(): void {
    if (this.isClickable) {
      this.itemClick.emit();
    }
  }

    onDeleteClicked(event: MouseEvent): void {
    event.stopPropagation(); // Prevent the itemClick event from firing when delete is clicked
    this.deleteClick.emit();
  }
}