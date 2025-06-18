import { Timestamp } from "@angular/fire/firestore";

export interface UserData {
      uid: string | null;
    email: string;
    displayName: string;
    photoURL: string | null;
    authProviders: string[];
    isRegistrationComplete: boolean | null;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
    dateOfBirth: string | null;
    phone: string | null;
    gender: string | null;
    hasActiveRainInsurance: boolean | null;
    rainInsuranceExpiresAt: Date | null;
}