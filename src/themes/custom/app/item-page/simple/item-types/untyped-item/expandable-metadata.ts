import { Component, Input, ElementRef, Renderer2, AfterViewInit, ViewChild } from '@angular/core';
import {
  NgIf,
  NgClass,
} from '@angular/common';

@Component({
  selector: 'app-expandable-metadata',
  standalone: true,
  template: `
    <div #containerRef [class.truncated]="isTruncated && !expanded">
      <ng-content></ng-content>
    </div>

    <div class="button-container" *ngIf="isTruncated" (click)="toggleExpand()">
      <div class="line"></div>
      <div class="arrow-container">
        <i class="fa-solid">{{ expanded ? '\u2303' : '\u2304' }}</i>
      </div>
    </div>
  `,
  styles: [`
    div.truncated {
      position: relative;
      overflow: hidden;
      max-height: calc(2em * 10); /* Altura máxima (10 líneas) */
    }

    div.truncated::after {
      content: ""; /* Degradado para dar la sensación de texto desapareciendo */
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2em; /* Ajusta la altura del degradado */
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, #e9ecef 100%);
      pointer-events: none;
    }

    .button-container {
      display: flex;
      flex-direction: column; /* Cambié de row a column para colocar la flecha debajo */
      align-items: center; /* Centra la flecha debajo de la línea */
      margin-top: .5rem;
      cursor: pointer;
      color: #6c757d; /* Color gris más neutro para el icono */
    }

    .button-container .line {
      width: 100%; /* Asegura que la línea ocupe todo el ancho */
      height: 1px;
      background-color: #ccc; /* Color gris más suave para la línea */
    }
  `],
  imports: [
    NgIf,
    NgClass,
  ],
})
export class ExpandableMetadataComponent implements AfterViewInit {
  @ViewChild('containerRef', { static: false }) containerRef!: ElementRef;

  @Input() maxLines = 10; // Número máximo de líneas
  isTruncated = false;
  expanded = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.checkTruncation();
  }

  checkTruncation() {
    const container = this.containerRef.nativeElement;

    const lineHeight = parseFloat(getComputedStyle(container).lineHeight);
    const maxHeight = lineHeight * this.maxLines;

    // Verifica si se necesita truncar
    if (container.scrollHeight > maxHeight) {
      this.isTruncated = true;
    }
  }

  toggleExpand() {
    this.expanded = !this.expanded;
    const container = this.containerRef.nativeElement;
    this.renderer.setStyle(container, 'max-height', this.expanded ? 'none' : `calc(2em * ${this.maxLines})`);

    // Desplazarse al principio del componente cuando se cierra
    if (!this.expanded) {
      this.scrollToTop();
    }
  }

  scrollToTop() {
    // Mueve el contenedor hacia la parte superior
    this.el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
