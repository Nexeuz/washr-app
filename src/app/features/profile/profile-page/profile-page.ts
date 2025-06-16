import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { FirestoreService, Vehicle, WashProgress } from '../../../core/services/firestore';
import { AuthService } from '../../../core/services/auth';
import { TitleService } from '../../../core/services/title';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    MatDividerModule,

  ],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.scss']
})
export class ProfilePageComponent implements OnInit {
  private router = inject(Router);
  private titleService = inject(TitleService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);

  userProfile = signal<UserProfile>({
    name: 'Olivia Bennett',
    email: 'olivia.bennett@example.com',
    phone: '(555) 123-4567',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyP74fhkzrMyod5BjQwo1x1B3PkRiDd5Vy7D6Pq39-BQeoLCxhTIepOhQvszvqO1tMTMv6CNP-sXgb6gMVuwyJDHswO0y3fFIedZS8i9NecDN_vg1CE51_YPA14blsaphkeDE16UJDLNLd1S-tXIFuojHkjoLSgDWzjqr1G0w-6WmOWDlLaqfsE61OSfBEEHuK2Ss35DgGfNWntB-nfgouboY2x-3iD3PgMEKfhICRqRDz9f8MxUOvxZvUKA-C1bIk6Nua8fj8rg'
  });

  vehicles = signal<Vehicle[]>([]);

  washProgress = signal<WashProgress>({
    current: 0,
    total: 10,
    percentage: 0
  });

  rainInsurance = signal({
    active: false,
    hoursRemaining: 0
  });

  isLoading = signal(true);

  ngOnInit(): void {
    this.titleService.setTitle('Mi Perfil');
    this.loadUserProfileData();
  }

  private loadUserProfileData(): void {
    // Get current user ID from auth service
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.uid) {
      console.error('No authenticated user found');
      this.isLoading.set(false);
      return;
    }

    const userId = currentUser.uid;

    // Load user data
    this.firestoreService.getUserData(userId).subscribe({
      next: (userData) => {
        if (userData) {
          this.userProfile.set({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            photoUrl: userData.photoUrl
          });

          this.rainInsurance.set({
            active: userData.hasActiveRainInsurance,
            hoursRemaining: userData.rainInsuranceExpiresAt 
              ? this.firestoreService.getRainInsuranceRemainingHours(userData.rainInsuranceExpiresAt)
              : 0
          });
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      }
    });

    // Load vehicles
    this.firestoreService.getUserVehicles(userId).subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
      }
    });

    // Load wash progress
    this.firestoreService.getUserWashRecords(userId).subscribe({
      next: (washRecords) => {
        const progress = this.firestoreService.calculateWashProgress(washRecords);
        this.washProgress.set(progress);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading wash records:', error);
        this.isLoading.set(false);
      }
    });
  }

  onVehiclesClick(): void {
    this.router.navigate(['/dasboard/vehicles/list']);
  }

  onBookingHistoryClick(): void {
    // Navigate to booking history
    console.log('Navegando al historial de reservas');
  }

  onPersonalDetailsClick(): void {
    this.router.navigate(['/profile/personal-info']);
  }

  onHelpSupportClick(): void {
    // Navigate to help & support
    console.log('Navegando a ayuda y soporte');
  }

  goBack(): void {
    this.router.navigate(['/dasboard']);
  }
}

