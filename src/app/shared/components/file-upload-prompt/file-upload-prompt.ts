import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal, HostBinding, OnInit, effect, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import imageCompression from 'browser-image-compression'; // Import the library



@Component({
  selector: 'app-file-upload-prompt',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './file-upload-prompt.html',
  styleUrls: ['./file-upload-prompt.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadPromptComponent implements OnChanges {

  // Add a host class for component-level styling scope
  @HostBinding('class.file-upload-prompt-host') hostClass = true;

  @Input() title: string = 'Add photo(s)';
  @Input() subtitle: string = 'Take or upload pictures';
  @Input() buttonText: string = 'Choose Photos';
  @Input() buttonIcon: string = 'add_a_photo'; // Material icon name
  @Input() buttonTextCamera: string = 'Take photo';
  @Input() buttonIconCamera: string = 'camera'; // Material icon name
  @Input() accept: string = 'image/*';
  @Input() multiple: boolean = false;
  @Input() maxPreviews: number = 5;
  @Input() vehicleImageUrl: string = ''; // Show camera button if true

  @Output() filesSelected = new EventEmitter<File[]>();

  // Signals for managing preview state
  selectedFileCount = signal(0);
  filePreviews = signal<(string | ArrayBuffer | null)[]>([]);

  constructor() {
    effect(() => {
 
      
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    // Initialize any necessary state or perform setup here
    if (changes['vehicleImageUrl'] && this.vehicleImageUrl) {
      // If a vehicle image URL is provided, set it as the first preview
      this.filePreviews.set([this.vehicleImageUrl]);
      this.selectedFileCount.set(1);
      
    }

  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }


    private async compressImage(files: FileList): Promise<File[]> {
    const options = {
      maxSizeMB: 1,          // Max file size in MB
      maxWidthOrHeight: 1920,  // Max width or height
      useWebWorker: true,      // Use web worker for better performance
      fileType: 'image/jpeg',  // Force output to jpeg for better compression
      quality: 0.8,            // Compression quality for jpeg
    };
          const temPFiles = Array.from(files);
    try {

      const filesProcessed = [];

      for (let index = 0; index < temPFiles.length; index++) {
       
        filesProcessed.push(await imageCompression(temPFiles[index], options));
         console.log(`Original size: ${(temPFiles[index].size / 1024 / 1024).toFixed(2)} MB`);
      
          console.log(`Compressed size: ${(filesProcessed[index].size / 1024 / 1024).toFixed(2)} MB`);
      }
     
      return filesProcessed;
    } catch (error) {
      console.error('Error compressing image:', error);
      return temPFiles; // Return original file if compression fails
    }
  }



async  onFileChanged(event: Event): Promise<void> {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    const newPreviews: (string | ArrayBuffer | null)[] = [];

    if (files && files.length > 0) {
      const compressedFiles = await this.compressImage(files);
      this.filesSelected.emit(compressedFiles);
      this.selectedFileCount.set(compressedFiles.length);

      const filesToPreviewArray = Array.from(compressedFiles).slice(0, this.maxPreviews);
      let filesProcessed = 0;

      if (filesToPreviewArray.length === 0) {
        this.filePreviews.set([]);
        return;
      }

      for (const file of filesToPreviewArray) {
        const reader = new FileReader();
        reader.onload = () => {
          newPreviews.push(reader.result);
          filesProcessed++;
          if (filesProcessed === filesToPreviewArray.length) {
            this.filePreviews.set([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
      element.value = ''; // Reset file input
    } else {
      this.selectedFileCount.set(0);
      this.filePreviews.set([]);
    }
  }

  onPromptButtonClicked(fileInput: HTMLInputElement): void {
    this.triggerFileInput(fileInput);
  }
}