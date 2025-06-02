import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HostWindowService } from 'src/app/shared/host-window.service';
import { Observable } from 'rxjs';

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
  @Input() title: string;
  @Input() type: string;
  isMobile$: Observable<boolean>;
  copySuccess: boolean = false;

  constructor(public activeModal: NgbActiveModal, private windowService: HostWindowService) {
    this.isMobile$ = this.windowService.isMobile();
  }

  copyToClipboard(element: HTMLInputElement) {
    navigator.clipboard.writeText(element.value).then(() => {
      this.copySuccess = true;
      setTimeout(() => this.copySuccess = false, 2000); // Ocultar el mensaje después de 2 segundos
    }).catch(err => {
      console.error('Error al copiar el texto: ', err);
    });
  }

  get researchGateLink(): string {
    const subject = `${this.type} compartido desde sedici.unlp.edu.ar`;
    const text = `¡Hola! Quiero compartir este/a ${this.type} desde el repositorio SEDICI (sedici.unlp.edu.ar).\n${this.title}\n${this.link}`;
    return `https://www.researchgate.net/messages?ocmd=1&messageModalSubject=${encodeURIComponent(subject)}&messageModalText=${encodeURIComponent(text)}`;
  }

  get mendeleyLink(): string {
    return `https://www.mendeley.com/import/?url=${encodeURIComponent(this.link)}`;
  }

  get whatsappLink(): string {
    let baseURL = '';
    this.isMobile$.subscribe(isMobile => {
      if (isMobile) {
        baseURL = 'https://api.whatsapp.com/send';
      } else {
        baseURL = 'https://web.whatsapp.com/send';
      }
    });
    const message = `¡Hola! Quiero compartir este/a ${this.type} desde el repositorio SEDICI (sedici.unlp.edu.ar).\n${this.title}\n${this.link}`;
    return `${baseURL}?text=${encodeURIComponent(message)}`;
  }

  get linkedinLink(): string {
    return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(this.link)}&title=${encodeURIComponent(this.title)}`;
  }

  get xLink(): string {
    return `https://x.com/share?text=${encodeURIComponent(this.title)}&url=${encodeURIComponent(this.link)}&via=sedici_unlp`;
  }
  
  close() {
    this.activeModal.close();
  }
}
