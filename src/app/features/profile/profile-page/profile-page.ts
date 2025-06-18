import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { FirestoreService } from '../../../core/services/firestore';
import { AuthService } from '../../../core/services/auth';
import { TitleService } from '../../../core/services/title';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header";
import { WashProgress } from '../../../core/model/whash-type';
import { Vehicle } from '../../../core/model/vehicle';
import { UserData } from '../../../core/model/user-data';
import { ProfilePhoneNumberSheetComponent } from '../profile-phone-number-sheet/profile-phone-number-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Firestore, updateDoc } from '@angular/fire/firestore';
import { doc } from 'firebase/firestore';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';


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
    MatProgressSpinnerModule,
    MatBottomSheetModule
  ],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.scss']
})
export class ProfilePageComponent implements OnInit {
  private router = inject(Router);
  private matButtonSheet = inject(MatBottomSheet);
  private titleService = inject(TitleService);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private _snackBar = inject(MatSnackBar);

  userProfile = signal({
    displayName: 'Olivia Bennett',
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
            displayName: userData.displayName || 'Usuario Anónimo',
            email: userData.email || 'No email provided',
            phone: userData.phone || 'No phone number provided',
            photoUrl: userData.photoURL || './assets/images/user.png'
          });

          this.rainInsurance.set({
            active: userData.hasActiveRainInsurance || false,
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

  onVehiclesClick(

  ): void {
    this.router.navigate(['/dashboard/vehicles/list']);
  }

  onBookingHistoryClick(): void {
    // Navigate to booking history
    console.log('Navegando al historial de reservas');
  }

  onPersonalPhoneNumber(): void {

    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.uid) {
      const bottomSheetRef = this.matButtonSheet.open(ProfilePhoneNumberSheetComponent, {
        disableClose: true,
              data: { currentPhoneNumber: this.userProfile().phone || null },
      });

      bottomSheetRef.afterDismissed().subscribe(async (newPhoneNumber: string | null) => {
        if (newPhoneNumber) {
          // Update the phone number in the user profile
          this.userProfile.set({
            ...this.userProfile(),
            phone: newPhoneNumber
          });

          // Optionally, save the new phone number to Firestore
          const currentUser = this.authService.getCurrentUser();
          if (currentUser?.uid) {
            try {
              const userDocRef = doc(this.firestore, 'users', currentUser?.uid);
              await updateDoc(userDocRef, {
                phone: newPhoneNumber
              });

              this._snackBar.open('Teléfono cambiado actualizado exitosamente.', 'Cerrar', { duration: 2000 });
            } catch (error) {
                            this._snackBar.open('Error al intentar actualizar el teléfono', 'Cerrar', { duration: 2000 });
              console.error('Error updating phone number in Firestore:', error);
            }

          }
        }
      });


    }




    // this.router.navigate(['/profile/personal-info']);
  }

  onHelpSupportClick(): void {
    // Navigate to help & support
    const phoneNumber = '573026854676';
    const menssage = `Hola, mi nombre es ${this.userProfile().displayName} necesito ayuda con el servicio de lavado de autos en la aplicación.`;
    const apiUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(menssage)}`;
    window.open(apiUrl, '_blank');

  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}

