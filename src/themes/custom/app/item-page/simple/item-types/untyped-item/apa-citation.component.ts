import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ds-apa-citation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apa-citation.component.html',
  styleUrls: ['./apa-citation.component.scss']
})
export class ApaCitationComponent implements OnInit {
  @Input() item: any;
  @ViewChild('elementContentToCopy') elementContentToCopy: ElementRef;
  citation: string;
  isExpanded: boolean = false;
  showToggleButton: boolean = false;

  ngOnInit(): void {
    this.generateCitation();
  }

  ngAfterViewInit(): void {
    this.checkContentHeight();
  }

  generateCitation(): void {
    const authors = this.getAuthors();
    const year = this.getYear();
    const title = this.getTitle();
    const journalTitle = this.getJournalTitle();
    const journalVolumeAndIssue = this.getJournalVolumeAndIssue();
    const pages = this.getPages();
    const source = this.getSource();

    this.citation = `${authors} (${year}). ${title}. ${journalTitle}, ${journalVolumeAndIssue}, ${pages}. ${source}.`;
  }

  getAuthors(): string {
    const authors = this.item.allMetadata(['sedici.creator.person']);
    return authors.map(author => author.value).join(', ');
  }

  getYear(): string {
    const date = this.item.firstMetadataValue('dc.date.issued');
    return date ? new Date(date).getFullYear().toString() : 's.f.';
  }

  getTitle(): string {
    return this.item.firstMetadataValue('dc.title') || 'Sin título';
  }

  getJournalTitle(): string {
    return this.item.firstMetadataValue('sedici.relation.journalTitle') || 'Sin journalTitle';
  }

  getJournalVolumeAndIssue(): string {
    return this.item.firstMetadataValue('sedici.relation.journalVolumeAndIssue') || 'Sin journalVolumeAndIssue';
  }

  getPages(): string {
    return this.item.firstMetadataValue('dc.format.extent') || 'Sin pages';
  }

  getSource(): string {
    return this.item.firstMetadataValue('dc.identifier.doi') || 'Sin fuente';
  }

  copyToClipboard(el: HTMLDivElement, id: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(el.innerText).then(() => {
        document.getElementById(id).classList.remove('fa-copy');
        document.getElementById(id).classList.add('fa-check');
        setTimeout(() => {
          document.getElementById(id).classList.remove('fa-check');
          document.getElementById(id).classList.add('fa-copy');
        }, 1000);
      }, (error) => {
        console.log(error);
      });
    } else {
      console.log('Browser do not support Clipboard API');
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  checkContentHeight(): void {
    const maxHeight = 195; // Altura máxima de la caja
    if (this.elementContentToCopy.nativeElement.scrollHeight > maxHeight) {
      this.showToggleButton = true;
    }
  }
}