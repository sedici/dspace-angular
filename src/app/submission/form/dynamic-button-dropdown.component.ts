import { Component, ElementRef, Renderer2, ViewChild, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-button-dropdown',
  templateUrl: './dynamic-button-dropdown.component.html',
  styleUrls: ['./dynamic-button-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DynamicButtonDropdownComponent implements AfterViewInit, OnDestroy {
  @Input() inputID: string;
  @Output() filterApplied = new EventEmitter<string>();
  @ViewChild('dropdown') dropdown!: ElementRef;

  private isDropdownOpen = false;
  private clickOutsideHandler: (event: Event) => void;

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

  constructor(private renderer: Renderer2) {
    this.clickOutsideHandler = this.handleClickOutside.bind(this);
  }

  ngAfterViewInit() {
    this.renderer.setStyle(this.dropdown.nativeElement, 'display', 'none');
  }

  ngOnDestroy() {
    this.removeClickOutsideListener();
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    this.isDropdownOpen = !this.isDropdownOpen;
    
    if (this.isDropdownOpen) {
      this.renderer.setStyle(this.dropdown.nativeElement, 'display', 'flex');
      this.addClickOutsideListener();
    } else {
      this.renderer.setStyle(this.dropdown.nativeElement, 'display', 'none');
      this.removeClickOutsideListener();
    }
  }

  private addClickOutsideListener(): void {
    setTimeout(() => {
      document.addEventListener('click', this.clickOutsideHandler);
    }, 0);
  }

  private removeClickOutsideListener(): void {
    document.removeEventListener('click', this.clickOutsideHandler);
  }

  private handleClickOutside(event: Event): void {
    if (this.dropdown && !this.dropdown.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  private closeDropdown(): void {
    this.isDropdownOpen = false;
    this.renderer.setStyle(this.dropdown.nativeElement, 'display', 'none');
    this.removeClickOutsideListener();
  }

  applyFilter(filter: string) {
    this.filterApplied.emit(filter);
    this.closeDropdown();
  }
}