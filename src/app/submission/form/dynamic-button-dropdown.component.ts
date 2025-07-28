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
    { title: 'upperCase\nPasa el texto completo a mayúsculas', filter: 'upperCase', text: 'AA' }, // Mayúsculas
    { title: 'lowerCase\nPasa el texto completo a minúsculas', filter: 'lowerCase', text: 'aa' }, // Minúsculas
    { title: 'Capitalize\nPasa la primera letra de cada oración a mayúscula', filter: 'capitalize', text: 'Aa' }, // Mayúscuya inicial
    { title: 'Reorder person name\nReodena un "Nombre Apellido" en "Apellido, Nombre" (SOLO SIRVE CON UNO DE CADA UNO)', filter: 'reorderPerson', icon: 'fa-solid fa-right-left' }, // Reordenar nombre/apellido
    { title: 'Remove titles\nElimina títulos o grados de las personas (Ej: Lic., Mg.)', filter: 'removeTitles', icon: 'fa-solid fa-bars' }, // Quitar títulos (Ej: Lic., Mg.)
    { title: 'Remove references\nElimina referencias asociadas de las personas (Ej: números, asteriscos)', filter: 'removeReferences', icon: 'fa-solid fa-bars' }, // Quitar referencias (Ej: números, asteriscos)
    { title: 'Remove double spaces\nElimina los espacios dobles', filter: 'removeDoubleSpaces', icon: 'fa-solid fa-bars' }, // Eliminar espacios dobles
    { title: 'Remove spaces between letters\nSaca espacios de donde no van (Ej: T I T U L O)', filter: 'removeSpacesBetweenLetters', icon: 'fa-solid fa-bars' } // Corregir espacios entre letras
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