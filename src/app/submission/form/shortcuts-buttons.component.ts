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
  @Input() onButtonClick: () => void;

  buttonsConfig = [
    {
      text: 'Enviar al campo',
      label: '<--',
      action: () => this.onButtonClick?.(),
      color: '#000000'
    }
  ];
}