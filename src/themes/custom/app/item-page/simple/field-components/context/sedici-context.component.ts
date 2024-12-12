import { Component,  Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';

@Component({
  selector: 'sedici-context',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sedici-context.component.html',
  styleUrls: ['./sedici-context.component.scss']
})
export class SediciContextComponent {

  @Input() object: DSpaceObject;

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
    if (bookTitle) {
      return bookTitle;
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
    return '';
  }
}