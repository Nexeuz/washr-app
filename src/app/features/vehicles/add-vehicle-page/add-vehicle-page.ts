// =================================================================================
// features/vehicles/add-vehicle-page/add-vehicle-page.component.ts
// Path: src/app/features/vehicles/add-vehicle-page/add-vehicle-page.component.ts
// =================================================================================
import { Component, OnInit, ChangeDetectionStrategy, signal, inject, HostBinding, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { FileUploadPromptComponent } from '../../../shared/components/file-upload-prompt/file-upload-prompt';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Shared Components

import { serverTimestamp, collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { getDownloadURL, ref, uploadBytes, Storage } from '@angular/fire/storage';
import { AuthService } from '../../../core/services/auth';
import { Subject, takeUntil } from 'rxjs';
import { User, user } from '@angular/fire/auth';
import { deleteObject } from 'firebase/storage';



// Services
// import { VehicleService } from '../../../core/services/vehicle.service';

// Typed Form Interface
interface AddVehicleForm {
  vehicleType: FormControl<string | null>;
  vehicleName: FormControl<string | null>;
  licensePlate: FormControl<string | null>;
  isTaxi: FormControl<boolean | null>;
}

// Interface for Vehicle Type Radio Options
interface VehicleTypeOption {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-vehicle-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, PageHeaderComponent, FileUploadPromptComponent,
    MatFormFieldModule, MatInputModule, MatRadioModule, MatSlideToggleModule,
    MatButtonModule, MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-vehicle-page.html',
  styleUrls: ['./add-vehicle-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddVehiclePageComponent implements OnInit, OnDestroy {
  @HostBinding('class.add-vehicle-page-host') hostClass = true;

  private fb = inject(FormBuilder);
  private storage = inject(Storage);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private activatedRouter = inject(ActivatedRoute);


  private destroy$ = new Subject<void>();

  private userId: string | null = null; // To hold the user ID from the route parameters
  private vehicleId: string | null = null; // To hold the vehicle ID from the route parameters




  isSaving = signal(false); // To show a loading spinner on the save button
  vehicleImageUrl = signal<string | null>(null); // To hold the URL of the uploaded vehicle image

  // private vehicleService = inject(VehicleService);

  addVehicleForm!: FormGroup<AddVehicleForm>;
  pageTitle = 'Agrega tu vehículo';

  vehicleTypeOptions: VehicleTypeOption[] = [
    { value: 'motorcycle', viewValue: 'Motocicleta' },
    { value: 'car', viewValue: 'Carro' },
  ];

  selectedVehiclePhotos = signal<File[] | null>(null);

  ngOnInit(): void {
    debugger
    this.addVehicleForm = this.fb.group({
      vehicleType: new FormControl('', Validators.required),
      vehicleName: new FormControl('', Validators.required),
      licensePlate: new FormControl('', Validators.required),
      isTaxi: new FormControl(false),
    });

    this.addVehicleForm.get('vehicleType')?.valueChanges.subscribe({
      next: (value) => {

        if (value === 'motorcycle') {
          this.addVehicleForm.get('isTaxi')?.disable();
          this.addVehicleForm.get('isTaxi')?.setValue(false);
        } else {
          this.addVehicleForm.get('isTaxi')?.enable();

        }
      }
    })

    this.activatedRouter.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.userId = params.get('userId');
      this.vehicleId = params.get('vehicleId');

      if (this.userId && this.vehicleId) {
        this.onLoadVehicleData(this.userId, this.vehicleId);
      }
    });
  }

  ngOnDestroy(): void {
    if (!this.destroy$.closed) {
      this.destroy$.next();
      this.destroy$.complete();
    }

  }

  async onLoadVehicleData(userId: string, vehicleId: string): Promise<void> {
    console.log(`Loading data for vehicle: ${vehicleId}`);
    const vehicleDocRef = doc(this.firestore, `users/${userId}/vehicles/${vehicleId}`);
    try {
      const docSnap = await getDoc(vehicleDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        this.addVehicleForm.patchValue({
          vehicleType: data['type'],
          vehicleName: data['name'],
          licensePlate: data['licensePlate'],
          isTaxi: data['isTaxi'],
        });
        if (data['imageUrl']) {
          this.vehicleImageUrl.set(data['imageUrl']);
        }
      } else {
        console.error(`No vehicle found with ID: ${vehicleId}`);
        this.snackBar.open('Vehículo no encontrado.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/vehicles/list']);
      }
    } catch (error) {
      console.error("Error loading vehicle data:", error);
      this.snackBar.open('Error al cargar los datos del vehículo.', 'Cerrar', { duration: 3000 });
    }
  }

  async onAddVehicle(): Promise<void> {
    this.addVehicleForm.markAllAsTouched();
    if (this.addVehicleForm.invalid || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.snackBar.open('Error: No has iniciado sesión.', 'Cerrar', { duration: 3000 });
      this.isSaving.set(false);
      return;
    }

    if (this.vehicleImageUrl() === null) {
      if ((this.selectedVehiclePhotos() ?? []).length === 0) {
        this.snackBar.open('Debes añadir una foto de tu vehículo', 'Ok', { duration: 3000 });
        this.isSaving.set(false);
        return;
      }
    }

    this.onAddVehicleFirestore(currentUser);

  }

  async onAddVehicleFirestore(currentUser: User): Promise<void> {
    try {

      // 2. Prepare data for Firestore
      const formValue = this.addVehicleForm.getRawValue(); // Use getRawValue to include disabled fields
      const vehicleData = {
        name: formValue.vehicleName,
        licensePlate: formValue.licensePlate,
        type: formValue.vehicleType,
        isTaxi: formValue.isTaxi,
        imageUrl: this.vehicleImageUrl() || null, // Initialize imageUrl as null
        createdAt: serverTimestamp(),
        ownerId: currentUser.uid,
      };
      // 3. Save vehicle data to Firestore

      if (this.vehicleId && this.vehicleId !== null && this.userId !== '' && this.userId !== null) {
        // If vehicleId is present, update the existing vehicle
        const vehicleDocRef = doc(this.firestore, `users/${currentUser.uid}/vehicles/${this.vehicleId}`);

     if (this.vehicleImageUrl()) {
        console.log(`Deleting old photo from storage: ${this.vehicleImageUrl()}`);
        try {
          const oldImageRef = ref(this.storage, this.vehicleImageUrl()!);
          await deleteObject(oldImageRef);
          console.log('Old photo deleted successfully.');

        } catch (error) {
          // Log error but don't block the update if deletion fails (e.g., file already gone)
          console.error("Could not delete old photo, it might already be gone:", error);
        }


          if (this.selectedVehiclePhotos()?.length === 1) {
            const photoUrl = await this.uploadVehiclePhotos(currentUser.uid, this.vehicleId);

            await updateDoc(vehicleDocRef, {
              ...vehicleData,
              imageUrl: photoUrl[0]
            });


          }
        } else {
            const vehicleDocRef = doc(this.firestore, `users/${currentUser.uid}/vehicles/${this.vehicleId}`);
            await updateDoc(vehicleDocRef, {
              ...vehicleData
            });
        
        }

      } else {
        const vehiclesColRef = collection(this.firestore, `users/${currentUser.uid}/vehicles`);
        const newDocRef = await addDoc(vehiclesColRef, vehicleData);

        console.log('Vehículo agregado con ID:', newDocRef.id);
        // 3. If there's a photo, upload it and update the document with the URL
        if (this.vehicleImageUrl() === null) {
          if (this.selectedVehiclePhotos()) {
            const photoUrl = await this.uploadVehiclePhotos(currentUser.uid, newDocRef.id);

            // 4. Update the newly created document with the photo URL
            const vehicleDocRef = doc(this.firestore, `users/${currentUser.uid}/vehicles/${newDocRef.id}`);
            await updateDoc(vehicleDocRef, {
              imageUrl: photoUrl
            });
            console.log('Documento del vehículo actualizado con la URL de la foto.');
          }
        }
      }

      this.snackBar.open('¡Vehículo agregado exitosamente!', 'Cerrar', { duration: 3000 });
      this.router.navigate(['list'], {relativeTo: this.activatedRouter}); // Go back to the previous page


    } catch (error) {
      console.error('Error al agregar el vehículo:', error);
      this.snackBar.open('Error al agregar el vehículo. Por favor, inténtelo de nuevo.', 'Cerrar', { duration: 3000 });
    } finally {
      this.isSaving.set(false); // Stop loading spinner
    }
  }

  private async uploadVehiclePhotos(userId: string, vehicleId: string): Promise<string[]> {
    const photos = this.selectedVehiclePhotos();
    if (!photos || photos.length === 0) {
      return []; // No photos to upload
    }

    const downloadUrls: string[] = [];
    const filesToUpload = Array.from(photos);

    for (const file of filesToUpload) {
      const filePath = `vehicle_photos/${userId}/vehicles/${vehicleId}${Date.now()}_${file.name}`;
      const storageRef = ref(this.storage, filePath);

      console.log(`Uploading ${file.name} to ${filePath}...`);
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      downloadUrls.push(downloadUrl);
      console.log(`Successfully uploaded ${file.name}. URL: ${downloadUrl}`);
    }

    return downloadUrls;
  }

  onDone(): void {
    console.log('Botón "Hecho" presionado - navegando a otra página.');
    this.router.navigate(['/dashboard']); // Navigate to dashboard or a "My Vehicles" list page
  }

  handleHeaderBackClick(): void {
    this.router.navigate(['list'], {relativeTo: this.activatedRouter}); // Go back to the previous page
  }
}