import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material Modules
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';

// Shared Components

// Services & Firestore
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { AuthService } from '../../../core/services/auth';
import { deleteDoc, doc, DocumentData, FirestoreDataConverter, getDoc, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { ref, Storage } from '@angular/fire/storage';
import { deleteObject } from 'firebase/storage';
import { TitleService } from '../../../core/services/title';
// Model for a vehicle
interface VehicleDisplayItem {
  name: string;
  licensePlate: string;
  isTaxi: boolean; // Optional field to indicate if it's a taxi
  imageUrl: string; // Optional image URL
  createdAt: Timestamp; // Firestore timestamp for creation date
  type: string; // Optional field for vehicle typ
  ownerId: string; // ID of the user who owns the vehicle
  id: string; // Optional ID field for the vehicle documen
}

const vehicleConverter: FirestoreDataConverter<VehicleDisplayItem> = {
  toFirestore(vehicle: VehicleDisplayItem): DocumentData {
    return {
      name: vehicle.name,
      licensePlate: vehicle.licensePlate,
      isTaxi: vehicle.createdAt,
      imageUrl: vehicle.imageUrl, // Ensure imageUrl is optional
      createdAt: vehicle.createdAt,
      ownerId: vehicle.ownerId,
      id: vehicle.id, // Include the document ID if needed
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): VehicleDisplayItem {
    const data = snapshot.data();
    return {
      id: snapshot.id, // Include the document ID
      name: data['name'],
      licensePlate: data['licensePlate'],
      isTaxi: data['isTaxi'] || false, // Default to false if not provided
      imageUrl: data['imageUrl'], // Ensure imageUrl is optional
      createdAt: data['createdAt'], // Default to now if not provided
      type: data['type'], // Optional field for vehicle type
      ownerId: data['ownerId'], // ID of the user who owns the vehicle
    };
  }
};

@Component({
  selector: 'app-vehicle-list-page',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './vehicle-list-page.html',
  styleUrls: ['./vehicle-list-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleListPageComponent implements OnInit, OnDestroy {

  @HostBinding('class.vehicle-list-page-host') hostClass = true;

  private destroy$ = new Subject<void>();

  router = inject(Router);
  private activeRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  private storage = inject(Storage);
  titleService = inject(TitleService); // Signal to hold breadcrumb data


  vehicles = signal<VehicleDisplayItem[]>([]);
  isLoading = signal(true); // To show a loading state initially

  constructor() { }

  ngOnInit(): void {
    this.titleService.setTitle('Mis Vehículos'); // Set the page titl
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.loadUserVehicles(currentUser.uid);
    } else {
      // This should be caught by an AuthGuard, but as a fallback:
      this.router.navigate(['/auth/login']);
    }
  }

  loadUserVehicles(userId: string): void {
    const vehiclesColRef = collection(this.firestore, `users/${userId}/vehicles`);
    const vehicles$ = collectionData(vehiclesColRef, { idField: 'id' }) as Observable<VehicleDisplayItem[]>;

    vehicles$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.isLoading.set(false);
        console.log('Vehicles loaded:', vehicles);
      },
      error: (error) => {
        console.error("Error fetching vehicles:", error);
        this.isLoading.set(false);
        this.snackBar.open('No se pudieron cargar los vehículos.', 'Cerrar', { duration: 3000 });
      }
    });
  }

async onAddVehicle(): Promise<void> {
    await this.router.navigate(['../add'], { relativeTo: this.activeRoute })
}

  onEditVehicle(vehicleId: string): void {
    console.log(`Navigating to edit vehicle with ID: ${vehicleId}`);
    // Assuming you will create an edit route like /vehicles/edit/:id
    this.router.navigate(['../edit',
      this.authService.getCurrentUser()?.uid || '', vehicleId],
       { relativeTo: this.activeRoute }
    );
  }

  async onDeleteVehicle(vehicleId: string): Promise<void> {
    console.log(`Deleting vehicle with ID: ${vehicleId}`);
    // Implement deletion logic here, e.g., call a service to delete the vehicle
    // For now, we will just log it

    if (this.authService.getCurrentUser()?.uid) {
      const addressDocRef = doc(this.firestore, `users/${this.authService.getCurrentUser()?.uid}/vehicles/${vehicleId}`).withConverter(vehicleConverter);
      const docSnap = await getDoc(addressDocRef);

      if (!docSnap.exists()) {
        this.snackBar.open(`Vehiculo no encontrado.`, 'Cerrar', { duration: 3000 });
        return;
      } else {

        try {
          const vehicleData = docSnap.data();

          // Check if the vehicle has an image URL and delete it from storage
          if (vehicleData.imageUrl) {
            const imageRef = ref(this.storage, vehicleData.imageUrl);
            await deleteObject(imageRef);

          }
          await deleteDoc(addressDocRef);
          this.snackBar.open(`Vehiculo ${vehicleData.name.toLowerCase()} eliminado.`, 'Cerrar', { duration: 3000 });

        } catch (error) {
          console.error("Error deleting vehicle:", error);
          this.snackBar.open(`Error al eliminar el vehiculo.`, 'Cerrar', { duration: 3000 });
          return;

        }

      }



    }


  }

  onConfirmSelection(): void {
    // This action might be for selecting a vehicle for a service
    console.log('Confirming vehicle selection and navigating away.');
    this.router.navigate(['/dashboard']); // Example navigation
  }

  handleHeaderBackClick(): void {
    // Navigate back to a relevant previous page, like dashboard or profile
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}