// src/app/shared/components/icon/icon.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { SafeHtmlPipe } from '../../pipes/safehtml-pipe';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [SafeHtmlPipe],
  template: `<span [class]="hostClasses" [innerHTML]="svgContent | safeHtml"></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center justify-center' }
})
export class  IconComponent {
  @Input() svgContent: string = '';
  @Input() hostClasses: string = '';
}