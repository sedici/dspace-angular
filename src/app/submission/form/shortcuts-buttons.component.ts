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
  @Output() buttonClicked = new EventEmitter<{ idElement: string }>();

  buttonsConfig = [
    {
      text: 'Enviar a',
      label: '<--',
      action: () => this.buttonClicked.emit({ idElement: 'focus' }),
      color: '#000000' // Negro
    },
    {
      text: 'Autores',
      label: 'As',
      action: () => this.buttonClicked.emit({ idElement: 'sedici_creator_person' }),
      color: '#0000ff' // Azul
    },
    {
      text: 'Palabras clave',
      label: 'PCs',
      action: () => this.buttonClicked.emit({ idElement: 'dc_subject' }),
      color: '#ff0000' // Rojo
    }
  ];
}