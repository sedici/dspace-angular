import { Component, ElementRef, Renderer2, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-button-dropdown',
  templateUrl: './dynamic-button-dropdown.component.html',
  styleUrls: ['./dynamic-button-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DynamicButtonDropdownComponent implements AfterViewInit, OnDestroy {
  @Output() filterApplied = new EventEmitter<string>();
  @ViewChild('dropdown') dropdown!: ElementRef;

  options = [
    { text: 'upperCase', filter: 'upperCase', icon: 'fa-solid fa-arrow-up-a-z' }, // Mayúsculas
    { text: 'lowerCase', filter: 'lowerCase', icon: 'fa-solid fa-arrow-down-a-z' }, // Minúsculas
    { text: 'Reorder person name', filter: 'reorderPerson', icon: 'fa-solid fa-right-left' }, // Reordenar nombre/apellido
    { text: 'Capitalize', filter: 'capitalize', icon: 'fa-solid fa-bars' }, // Mayúscuya inicial
    { text: 'Remove titles', filter: 'removeTitles', icon: 'fa-solid fa-bars' }, // Quitar títulos (Ej: Lic., Mg.)
    { text: 'Remove double spaces', filter: 'removeDoubleSpaces', icon: 'fa-solid fa-bars' }, // Eliminar espacios dobles
    { text: 'Remove references', filter: 'removeReferences', icon: 'fa-solid fa-bars' }, // Quitar referencias (Ej: números, asteriscos)
    { text: 'Remove spaces between letters', filter: 'removeSpacesBetweenLetters', icon: 'fa-solid fa-bars' } // Corregir espacios entre letras
  ];

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Asegúrate de que el dropdown esté oculto inicialmente
    this.renderer.setStyle(this.dropdown.nativeElement, 'display', 'none');

    // Agregar un EventListener para cerrar el dropdown al hacer clic fuera de él
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    // Eliminar el EventListener cuando el componente se destruya
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  toggleDropdown(event: Event) {
    event.preventDefault(); // Evita que el botón reciba foco y cambie estilos
    event.stopPropagation(); // Evita que el evento se propague y cierre el dropdown inmediatamente
    const display = this.dropdown.nativeElement.style.display;
    this.dropdown.nativeElement.style.display = display === 'none' ? 'flex' : 'none';
  }

  handleClickOutside(event: Event) {
    if (this.dropdown && !this.dropdown.nativeElement.contains(event.target as Node)) {
      this.dropdown.nativeElement.style.display = 'none';
    }
  }

  applyFilter(filter: string) {
    this.filterApplied.emit(filter);
    this.dropdown.nativeElement.style.display = 'none'; // Cerrar el dropdown al seleccionar una opción
  }
}