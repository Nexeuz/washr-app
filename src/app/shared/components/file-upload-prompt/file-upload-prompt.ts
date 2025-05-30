import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button';
import { IconComponent } from "../icon/icon"; // Assuming app-button

@Component({
  selector: 'app-file-upload-prompt',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent], // Use direct import names
  templateUrl: './file-upload-prompt.html',
  styleUrls: ['./file-upload-prompt.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Use direct import name
  host: {
    class: 'block w-full',
  }
})
export class FileUploadPromptComponent {
  @Input() title: string = 'Add photo'; // Use direct import name
  @Input() subtitle: string = 'Take or upload a photo';
  @Input() buttonText: string = 'Add photo';
  @Input() accept: string = 'image/*'; // For file input accept attribute
  @Input() customContainerClasses: string = 'flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors px-6 py-14 cursor-pointer';
  @Input() customTitleClasses: string = 'text-[#141414] text-lg font-bold leading-tight tracking-[-0.015em] text-center';
  @Input() customSubtitleClasses: string = 'text-neutral-600 text-sm font-normal leading-normal max-w-xs text-center';

  @Output() fileSelected = new EventEmitter<File>(); // Use direct import name
  @Output() buttonClicked = new EventEmitter<void>(); // If button action is separate from file input

  // For triggering the hidden file input
  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  onFileChanged(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.fileSelected.emit(element.files[0]);
      element.value = ''; // Reset file input to allow selecting the same file again
    }
  }

  // In case the button itself has a different action than just opening the file dialog
  onPromptButtonClicked(fileInput: HTMLInputElement): void {
    this.buttonClicked.emit();
    this.triggerFileInput(fileInput); // Default behavior: open file dialog
  }
}