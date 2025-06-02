import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-file-upload-prompt',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './file-upload-prompt.html',
  styleUrls: ['./file-upload-prompt.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full', // Ensures the component takes up block space
  }
})
export class FileUploadPromptComponent {
  @Input() title: string = 'Add photo(s)';
  @Input() subtitle: string = 'Take or upload pictures';
  @Input() buttonText: string = 'Choose Photos';
  @Input() buttonIcon: string = 'add_a_photo'; // Material icon name for the button
  @Input() accept: string = 'image/*'; // File types to accept
  @Input() multiple: boolean = false;    // Allow multiple file selection by default
  @Input() customContainerClasses: string = 'flex flex-col items-center gap-4 sm:gap-6 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors px-6 py-10 sm:py-14 cursor-pointer';
  @Input() customTitleClasses: string = 'text-[#141414] dark:text-neutral-100 text-lg font-bold leading-tight tracking-[-0.015em] text-center';
  @Input() customSubtitleClasses: string = 'text-neutral-600 dark:text-neutral-300 text-sm font-normal leading-normal max-w-xs text-center';
  @Input() maxPreviews: number = 5; // Maximum number of previews to show

  @Output() filesSelected = new EventEmitter<FileList>(); // Emits the FileList object

  // Signals for managing preview state
  selectedFileCount = signal(0);
  // Store an array of data URLs for previews
  filePreviews = signal<(string | ArrayBuffer | null)[]>([]);


  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click(); // Programmatically click the hidden file input
  }

  onFileChanged(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files; // This is a FileList
    const newPreviews: (string | ArrayBuffer | null)[] = [];

    if (files && files.length > 0) {
      this.filesSelected.emit(files); // Emit the entire FileList
      this.selectedFileCount.set(files.length);

      // Generate previews for selected files (up to maxPreviews)
      const filesToPreviewArray = Array.from(files).slice(0, this.maxPreviews);

      let filesProcessed = 0;
      if (filesToPreviewArray.length === 0) { // Handle case where maxPreviews might be 0
        this.filePreviews.set([]);
      } else {
        for (const file of filesToPreviewArray) {
          const reader = new FileReader();
          reader.onload = () => {
            newPreviews.push(reader.result);
            filesProcessed++;
            // Update signal when all selected files for preview are processed
            if (filesProcessed === filesToPreviewArray.length) {
              this.filePreviews.set([...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
      element.value = ''; // Reset file input to allow selecting the same file(s) again if needed
    } else {
      this.selectedFileCount.set(0);
      this.filePreviews.set([]);
    }
  }

  // This method is called when the main container or the button is clicked
  onPromptButtonClicked(fileInput: HTMLInputElement): void {
    this.triggerFileInput(fileInput);
  }
}