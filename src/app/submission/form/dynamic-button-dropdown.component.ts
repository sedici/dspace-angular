import { Component, ElementRef, Renderer2, ViewChild, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { MetadataConfig } from '../models/metadata-config.model';
import { FilterInfo, FilterConfig } from '../models/filter-config.model';

@Component({
  selector: 'app-dynamic-button-dropdown',
  templateUrl: './dynamic-button-dropdown.component.html',
  styleUrls: ['./dynamic-button-dropdown.component.scss'],
  standalone: true,
  imports: []
})
export class DynamicButtonDropdownComponent implements AfterViewInit, OnDestroy {
  @Input() inputID: string;
  @Output() filterApplied = new EventEmitter<string>();
  @ViewChild('dropdown') dropdown!: ElementRef;

  private isDropdownOpen = false;
  private clickOutsideHandler: (event: Event) => void;

  private repeatableMetadata: string[] = MetadataConfig.REPEATABLE_METADATA;
  private peopleMetadata: string[] = MetadataConfig.PEOPLE_METADATA;

  private generalMetadataFilter: FilterInfo[] = FilterConfig.GENERAL_METADATA_FILTER;
  private repeatableMetadataFilter: FilterInfo[] = FilterConfig.REPEATABLE_METADATA_FILTER;
  private peopleMetadataFilter: FilterInfo[] = FilterConfig.PEOPLE_METADATA_FILTER;

  options: FilterInfo[] = [];

  constructor(private renderer: Renderer2) {
    this.clickOutsideHandler = this.handleClickOutside.bind(this);
  }

  ngOnInit() {
    this.options = this.generalMetadataFilter;
    if (this.peopleMetadata.includes(this.inputID)) {
      this.options = this.options.concat(this.peopleMetadataFilter);
    }
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