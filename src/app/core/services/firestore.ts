import { Injectable, inject } from '@angular/core';
import {  collection, doc, getDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Observable, from, map, catchError, of, switchMap, forkJoin, finalize } from 'rxjs';
import { UserData } from '../model/user-data';
import { Vehicle } from '../model/vehicle';
import { WashProgress, WashRecord } from '../model/whash-type';
import { LoadingService } from './loading.service';



@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
    private loadingService = inject(LoadingService); // Inject the LoadingService
  private firestore = inject(Firestore);

  // Get user data by user ID
  getUserData(userId: string): Observable< UserData | null> {
        this.loadingService.showLoading(); // Show loading spinner
    const userDocRef = doc(this.firestore, 'users', userId);

    
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            uid: docSnap.id,
            displayName: data['displayName'] || '',
            email: data['email'] || '',
            photoURL: data['photoURL'] || null,
            phone: data['phone'] || null,
            authProviders: data['authProviders'] || [],
            isRegistrationComplete: data['isRegistrationComplete'] || false,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date(),
            dateOfBirth: data['dateOfBirth'] ? data['dateOfBirth'] : null,
            gender: data['gender'] ?? null,
            hasActiveRainInsurance: this.checkActiveRainInsurance(data['rainInsuranceExpiresAt']),
            rainInsuranceExpiresAt: data['rainInsuranceExpiresAt']?.toDate()
          } as UserData;
        } else {
                  return null;

        }
      }),
      catchError(error => {
        console.error('Error getting user data:', error);
        return of(null);
      }),
      finalize(() => this.loadingService.hideLoading()) // Hide loading spinner on completion or error
    );
  }

  // Get vehicles for a specific user
  getUserVehicles(userId: string): Observable<Vehicle[]> {
            this.loadingService.showLoading(); // Show loading spinner
    const vehiclesRef = collection(this.firestore, 'users', userId, 'vehicles'); // Updated path
    const vehiclesQuery = query(
      vehiclesRef,
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(vehiclesQuery)).pipe(
      map(querySnapshot => {
        const vehicles: Vehicle[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          vehicles.push({
            id: doc.id,
            userId: userId, // userId is now known from the path
            name: data['name'] || data['vehicleName'],
            licensePlate: data['licensePlate'],
            type: data['type'] || data['vehicleType'],
            imageUrl: data['imageUrl'],
            isTaxi: data['isTaxi'] || false,
            createdAt: data['createdAt']?.toDate() || new Date()
          });
        });
        return vehicles;
      }),
      catchError(error => {
        console.error('Error getting user vehicles:', error);
        return of([]);
      }),
      finalize(() => this.loadingService.hideLoading()) // Hide loading spinner on completion or error
    );
  }

  // Get wash records for a user to calculate progress towards free wash
  getUserWashRecords(userId: string): Observable<WashRecord[]> {
                this.loadingService.showLoading(); // Show loading spinner
    const washesRef = collection(this.firestore, 'washes');
    const washesQuery = query(
      washesRef,
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('washDate', 'desc'),
      limit(50) // Limit to recent washes for performance
    );

    return from(getDocs(washesQuery)).pipe(
      map(querySnapshot => {
        const washes: WashRecord[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          washes.push({
            id: doc.id,
            userId: data['userId'],
            vehicleId: data['vehicleId'],
            washDate: data['washDate']?.toDate() || new Date(),
            washType: data['washType'] || 'standard',
            status: data['status'],
            location: data['location'] || ''
          });
        });
        return washes;
      }),
      finalize(() => this.loadingService.hideLoading()), // Hide loading spinner on completion or error
      catchError(error => {
        console.error('Error getting wash records:', error);
        return of([]);
      })
    );
  }

  // Calculate wash progress towards free wash
  calculateWashProgress(washRecords: WashRecord[]): WashProgress {
    const totalRequired = 10; // 10 washes to earn a free wash
    const completedWashes = washRecords.filter(wash => wash.status === 'completed').length;
    const currentProgress = completedWashes % totalRequired; // Reset after each free wash earned
    
    return {
      current: currentProgress,
      total: totalRequired,
      percentage: (currentProgress / totalRequired) * 100
    };
  }

  // Check if rain insurance is active
  private checkActiveRainInsurance(expiresAt: any): boolean {
    if (!expiresAt) return false;
    
    const expirationDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    return expirationDate > new Date();
  }

  // Get remaining hours for rain insurance
  getRainInsuranceRemainingHours(expiresAt: Date): number {
    if (!expiresAt) return 0;
    
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    
    return diffHours;
  }

  // Get comprehensive user profile data
  getUserProfileData(userId: string): Observable<{
    userData: UserData | null;
    vehicles: Vehicle[];
    washProgress: WashProgress;
    rainInsuranceHours: number;
  }> {
   this.loadingService.showLoading(); // Show loading spinner
    return this.getUserData(userId).pipe(
      switchMap(userData => {
        if (!userData) {
          return of({
            userData: null,
            vehicles: [],
            washProgress: { current: 0, total: 10, percentage: 0 },
            rainInsuranceHours: 0
          });
        }
        return forkJoin({
          vehicles: this.getUserVehicles(userId).pipe(catchError(() => of([]))),
          washRecords: this.getUserWashRecords(userId).pipe(catchError(() => of([])))
        }).pipe(
          map(({ vehicles, washRecords }) => {
            const washProgress = this.calculateWashProgress(washRecords || []);
            const rainInsuranceHours = userData.rainInsuranceExpiresAt
              ? this.getRainInsuranceRemainingHours(userData.rainInsuranceExpiresAt)
              : 0;
            return {
              userData,
              vehicles: vehicles || [],
              washProgress,
              rainInsuranceHours
            };
          })
        );
      }),
      catchError(error => {
        console.error('Error getting user profile data:', error);
        return of({
          userData: null,
          vehicles: [],
          washProgress: { current: 0, total: 10, percentage: 0 },
          rainInsuranceHours: 0
        });
      }),
      finalize(() => this.loadingService.hideLoading()), // Hide loading spinner on completion or error
    );
  }
}

