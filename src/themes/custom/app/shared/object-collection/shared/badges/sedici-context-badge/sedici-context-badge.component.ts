import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { BadgesComponent as BaseComponent } from '../badges.component';

import { ThemedAccessStatusBadgeComponent } from 'src/app/shared/object-collection/shared/badges/access-status-badge/themed-access-status-badge.component';
import { ThemedMyDSpaceStatusBadgeComponent } from 'src/app/shared/object-collection/shared/badges/my-dspace-status-badge/themed-my-dspace-status-badge.component';
import { ThemedStatusBadgeComponent } from 'src/app/shared/object-collection/shared/badges/status-badge/themed-status-badge.component';
import { ThemedTypeBadgeComponent } from 'src/app/shared/object-collection/shared/badges/type-badge/themed-type-badge.component';

@Component({
  selector: 'ds-sedici-context-badge',
  styleUrls: ['./sedici-context-badge.component.scss'],
  templateUrl: './sedici-context-badge.component.html',
  standalone: true,
  imports: [ThemedStatusBadgeComponent, NgIf, ThemedMyDSpaceStatusBadgeComponent, ThemedTypeBadgeComponent, ThemedAccessStatusBadgeComponent],
})
export class SediciContextBadgeComponent extends BaseComponent {

  getYear(): string {
    let dateString = this.object.firstMetadataValue('dc.date.issued') || this.object.firstMetadataValue('dc.date.created') || this.object.firstMetadataValue('sedici.date.exposure');
    if (dateString) {
      return dateString.split('-')[0];
    }
    return '';
  }
}
