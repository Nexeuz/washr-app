import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { Subscription } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { AddressFormComponent } from '../address-form/address-form';

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

  pageHeaderTitle = signal('Manage Address');
  editingAddressId = signal<string | null>(null);
  private routeSub?: Subscription;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.editingAddressId.set(id);
      this.openAddressSheet(id);
    });
  }

  openAddressSheet(addressId: string | null): void {
    const bottomSheetRef = this.bottomSheet.open(AddressFormComponent, {
      data: { addressId: addressId },
      disableClose: true,
      panelClass: 'custom-bottom-sheet-container' // Optional: for global styling of the sheet container
    });

    bottomSheetRef.afterDismissed().subscribe(result => {
      console.log('Address form sheet dismissed. Result:', result);
      if (result) {
        if (addressId) { console.log('Updating address:', addressId, result); }
        else { console.log('Adding new address:', result); }
      }
      this.router.navigate(['/profile/personal-info']);
    });
  }

  handleHeaderBackClick(): void {
    this.router.navigate(['/profile/personal-info']);
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }
}