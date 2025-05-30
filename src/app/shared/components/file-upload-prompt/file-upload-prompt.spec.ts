import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUploadPrompt } from './file-upload-prompt';

describe('FileUploadPrompt', () => {
  let component: FileUploadPrompt;
  let fixture: ComponentFixture<FileUploadPrompt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadPrompt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileUploadPrompt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
