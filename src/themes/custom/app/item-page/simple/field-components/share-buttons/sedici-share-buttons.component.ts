import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sedici-share-buttons',
  templateUrl: './sedici-share-buttons.component.html',
  styleUrls: ['./sedici-share-buttons.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class SediciShareButtonsComponent {

  @ViewChild('elementContentToCopy') elementContentToCopy: ElementRef;
  @Input() link: string;
  copySuccess: boolean = false;

  constructor(public activeModal: NgbActiveModal) {}

  copyToClipboard(element: HTMLInputElement) {
    navigator.clipboard.writeText(element.value).then(() => {
      this.copySuccess = true;
      setTimeout(() => this.copySuccess = false, 2000); // Ocultar el mensaje después de 2 segundos
    }).catch(err => {
      console.error('Error al copiar el texto: ', err);
    });
  }

  close() {
    this.activeModal.close();
  }
}
