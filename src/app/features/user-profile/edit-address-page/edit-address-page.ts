import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { AddressFormComponent } from '../address-form/address-form';

import { doc, getDoc, setDoc, serverTimestamp, DocumentData, getDocFromCache, Timestamp, collection, addDoc, updateDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-edit-address-page',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, MatBottomSheetModule],
  templateUrl: './edit-address-page.html',
  styleUrls: ['./edit-address-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAddressPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bottomSheet = inject(MatBottomSheet);
  private cd = inject(ChangeDetectorRef);
  private firestore = inject(Firestore);
  private addressId: string | null = null;



  pageHeaderTitle = signal('Administrar direcciones');
  editingAddressId = signal<string | null>(null);
  private routeSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const userId = params.get('userId');
      this.addressId = params.get('id')
      this.editingAddressId.set(userId);
      setTimeout(() => {
        this.openAddressSheet(userId, this.addressId);

      })

    });
  }

  openAddressSheet(userId: string | null, addressId?: string | null): void {
  
  }

  handleHeaderBackClick(): void {
    this.router.navigate(['/profile/personal-info']);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}