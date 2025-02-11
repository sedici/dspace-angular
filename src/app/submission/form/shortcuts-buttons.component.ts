import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shortcuts-buttons',
  templateUrl: './shortcuts-buttons.component.html',
  styleUrls: ['./shortcuts-buttons.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ShortcutsButtonsComponent {
  @Input() rect: DOMRect;
  @Output() buttonClicked = new EventEmitter<{ idElement: string, multiple: boolean }>();

  buttonsConfig = [
    {
      text: 'Título',
      label: 'T',
      action: () => this.buttonClicked.emit({ idElement: 'dc_title', multiple: false }),
      color: '#00ff00' // Verde
    },
    {
      text: 'Autor',
      label: 'A',
      action: () => this.buttonClicked.emit({ idElement: 'sedici_creator_person', multiple: false }),
      color: '#0000ff' // Azul
    },
    {
      text: 'Autores',
      label: 'As',
      action: () => this.buttonClicked.emit({ idElement: 'sedici_creator_person', multiple: true }),
      color: '#0000ff' // Azul
    },
    {
      text: 'Palabra clave',
      label: 'PC',
      action: () => this.buttonClicked.emit({ idElement: 'dc_subject', multiple: false }),
      color: '#ff0000' // Rojo
    },
    {
      text: 'Palabras clave',
      label: 'PCs',
      action: () => this.buttonClicked.emit({ idElement: 'dc_subject', multiple: true }),
      color: '#ff0000' // Rojo
    }
  ];
}