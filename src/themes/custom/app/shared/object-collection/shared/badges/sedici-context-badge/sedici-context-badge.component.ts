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

  getBookInfo(): string {
    const bookTitle = this.object.firstMetadataValue('sedici.relation.bookTitle');
    const isPartOf = this.object.firstMetadataValue('dc.relation.ispartof');
    
    if (bookTitle && isPartOf) {
      return `${bookTitle}; ${isPartOf}`;
    } else if (bookTitle) {
      return bookTitle;
    } else if (isPartOf) {
      return isPartOf;
    }
    return '';
  }

  getJournalInfo(): string {
    const journalTitle = this.object.firstMetadataValue('sedici.relation.journalTitle');
    const journalVolumeAndIssue = this.object.firstMetadataValue('sedici.relation.journalVolumeAndIssue');
    
    if (journalTitle && journalVolumeAndIssue) {
      return `${journalTitle}; ${journalVolumeAndIssue}`;
    } else if (journalTitle) {
      return journalTitle;
    }
    return '';
  }

  getEventInfo(): string {
    const event = this.object.firstMetadataValue('sedici.relation.event');
    if (event) {
      return event;
    }
    return '';
  }

  getCicloInfo(): string {
    const ciclo = this.object.firstMetadataValue('sedici.relation.ciclo');
    if (ciclo) {
      return ciclo;
    }
    return '';
  }

  getOriginInfoPlace(): string {
    let originInfo = this.object.firstMetadataValue('mods.originInfo.place');
    if (originInfo) {
      return originInfo;
    }
    return '';
  }

  getContextInfo(): string {
    const thesis = this.getThesisInfo();
    if (thesis) {
      return thesis;
    };
    const bookTitle = this.getBookInfo();
    if (bookTitle) {
      return bookTitle;
    };
    const journal = this.getJournalInfo();
    const event = this.getEventInfo();
    if (journal || event) {
      if (journal && event) {
        return `${journal} | ${event}`;
      } else if (journal) {
        return journal;
      } else {
        return event;
      };
    };
    const ciclo = this.getCicloInfo();
    if (ciclo) {
      return ciclo;
    };
    const originInfo = this.getOriginInfoPlace();
    if (originInfo) {
      return originInfo;
    };
    return '';
  }

  getYear(): string {
    let dateString = this.object.firstMetadataValue('dc.date.issued') || this.object.firstMetadataValue('dc.date.created') || this.object.firstMetadataValue('sedici.date.exposure');
    if (dateString) {
      return dateString.split('-')[0];
    }
    return '';
  }
}
