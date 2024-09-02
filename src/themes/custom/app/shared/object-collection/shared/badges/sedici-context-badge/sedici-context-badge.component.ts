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

  getThesisInfo(): string {
    const thesisDegreeName = this.object.firstMetadataValue('thesis.degree.name');
    const thesisDegreeGrantor = this.object.firstMetadataValue('thesis.degree.grantor');

    if (thesisDegreeName && thesisDegreeGrantor) {
      return `${thesisDegreeName}; ${thesisDegreeGrantor}`;
    } else {
      return '';
    }
  }

  getJournalInfo(): string {
    const journalTitle = this.object.firstMetadataValue('sedici.relation.journalTitle');
    const journalVolumeAndIssue = this.object.firstMetadataValue('sedici.relation.journalVolumeAndIssue');
    
    if (journalTitle && journalVolumeAndIssue) {
      return `${journalTitle}; ${journalVolumeAndIssue}`;
    } else if (journalTitle) {
      return journalTitle;
    } else {
      return '';
    }
  }

  getOriginInfoPlace(): string {
    let place = this.object.firstMetadataValue('mods.originInfo.place');
    if (!place) {
      return '';
    }
    return place;
  }

  getEventInfo(): string {
    let event = this.object.firstMetadataValue('sedici.relation.event');
    if (!event) {
      return '';
    }
    return event;
  }

  getContextInfo(): string {
    let thesis = this.getThesisInfo();
    let journal = this.getJournalInfo();
    let event = this.getEventInfo();
    let origin = this.getOriginInfoPlace();
    if (thesis) {
      return thesis;
    };
    if (journal || event) {
      if (journal && event) {
        return `${journal} | ${event}`;
      } else if (journal) {
        return journal;
      } else {
        return event;
      };
    };
    return origin;
  }

  getYear(): string {
    let dateString = this.object.firstMetadataValue('dc.date.issued') || this.object.firstMetadataValue('dc.date.created');
    if (!dateString) {
      return '';
    }
    return dateString.split('-')[0];
  }
}
