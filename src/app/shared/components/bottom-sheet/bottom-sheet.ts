// Path: src/app/shared/components/bottom-sheet/bottom-sheet.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common'; // For @if directive and other common features

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-sheet.html',
  styleUrls: ['./bottom-sheet.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent {
  @Input() isOpen: boolean = false;
  @Input() sheetTitle: string = ''; // Optional title for the sheet header
  @Input() showDragHandle: boolean = true;
  @Input() closeOnOverlayClick: boolean = true;

  @Output() closeSheet = new EventEmitter<void>(); // Emits when the sheet requests to be closed

  onOverlayClicked(event: MouseEvent): void {
    if (this.closeOnOverlayClick && (event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeSheet.emit();
    }
  }

  // Method to be called by an explicit close button within the projected content if needed
  requestClose(): void {
    this.closeSheet.emit();
  }
}