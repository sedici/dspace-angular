import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sedici-citation',
  templateUrl: './sedici-citation.component.html',
  styleUrls: ['./sedici-citation.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class SediciCitationComponent implements OnInit {

  @ViewChild('elementContentToCopy') elementContentToCopy: ElementRef;
  citation: string;
  citationType: string = 'apa';

  citationOptions = [
    { value: 'apa', label: 'APA' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'mla', label: 'MLA' },
  ];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.generateCitation(this.citationType);
  }

  generateCitation(type: string): void {
    if (type === 'apa') {
      this.citation = 'Melville, H. & Schaeffer, M. (1922) Moby Dick. New York, Dodd, Mead and company. [Pdf] Retrieved from the Library of Congress, https://www.loc.gov/item/22022440/';
    } else if (type === 'chicago') {
      this.citation = 'Melville, Herman, and Mead Schaeffer. Moby Dick. New York, Dodd, Mead and company, 1922. Pdf. https://www.loc.gov/item/22022440/';
    } else {
      this.citation = 'Melville, Herman, and Mead Schaeffer. Moby Dick. New York, Dodd, Mead and company, 1922. Pdf. Retrieved from the Library of Congress, <www.loc.gov/item/22022440/>';
    }
  }

  onCitationTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.citationType = selectElement.value;
    this.generateCitation(this.citationType);
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

  close() {
    this.activeModal.close();
  }
}
