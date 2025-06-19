import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinner {
  isLoading = inject(LoadingService).loading$;
}