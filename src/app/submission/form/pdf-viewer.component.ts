import { Component, Input, ViewChild, ChangeDetectorRef, NgZone, ComponentRef, AfterViewInit, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { filterTransformer } from '../../../../zfilterTransformer/filterTransformer.js';
import { DynamicButtonDropdownComponent } from './dynamic-button-dropdown.component';
import { ShortcutsButtonsComponent } from './shortcuts-buttons.component';
import { SectionFormOperationsService } from '../sections/form/section-form-operations.service';
import { JsonPatchOperationPathCombiner } from '../../core/json-patch/builder/json-patch-operation-path-combiner';
import { DateSplitter, VolumeIssueSplitter } from '../utils/content-splitters';
import { MetadataConfig } from '../models/metadata-config.model';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  standalone: true,
  imports: [
		NgIf,
		NgFor,
    NgStyle,
		FormsModule,
		PdfJsViewerModule,
    NgbDropdownModule,
    DynamicButtonDropdownComponent,
    ShortcutsButtonsComponent,
	],
})
// export class PdfViewerComponent {
export class PdfViewerComponent implements AfterViewInit {
	@Input() pdfUrl: string;
	@ViewChild('pdfViewerOnDemand') pdfViewerOnDemand;

  // Propiedades del visor
  iframe;
  container;
  pdfIsLoading = true;
  private buttonComponents: ComponentRef<ShortcutsButtonsComponent>[] = [];

  // Estado de la selección de texto
  selectedText: string = '';
  isTextSelected: boolean = false;
  selectedMetadataField: string = '';
  replaceText: boolean = false;
  
  // Configuración de metadatos
  metadataOptions = [];
  repeatableMetadata: string[] = MetadataConfig.REPEATABLE_METADATA;
  repeatableAndExtensibleMetadata: string[] = MetadataConfig.REPEATABLE_AND_EXTENSIBLE_METADATA;

  // Estado de elementos dinámicos
  showDynamicInputs: boolean = false;
  isDropdownOpen = false;
  applyFilterToSubmissionField: boolean = false;
  private elementsAmount: number = 0;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private ngZone: NgZone,
    private formOperationsService: SectionFormOperationsService
  ) { }

  ngAfterViewInit() {
    this.initializeButtons();
    this.interceptFormOperationChanges();
  }

  ngAfterViewChecked() {
    this.checkElementsCountAndUpdateButtons();
  }

  public pagesLoadedEvent(): void {
    this.iframe = this.pdfViewerOnDemand.iframe.nativeElement;
    this.container = this.iframe.contentDocument.body;
    const pdfApp = this.iframe.contentWindow?.PDFViewerApplication;
    pdfApp.appConfig.viewerContainer.onmouseup = this.onTextSelected.bind(this);
  }
  
  private interceptFormOperationChanges(): void {
    const originalDispatch = this.formOperationsService.dispatchOperationsFromChangeEvent;
    this.formOperationsService.dispatchOperationsFromChangeEvent = 
      (pathCombiner: JsonPatchOperationPathCombiner, event: any, previousValue: any, hasStoredValue: boolean) => {
        if (event?.model?.id === 'dc_type' || event?.model?.id === 'sedici_subtype') {
          setTimeout(() => {
            this.addButtonsToInputs();
          }, 500);
        }
        return originalDispatch.call(this.formOperationsService, pathCombiner, event, previousValue, hasStoredValue);
    };
  }
  
  private checkElementsCountAndUpdateButtons(): void {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    const inputs = Array.from(document.querySelectorAll('input'));
    const elements = [...textareas, ...inputs];
    if (this.elementsAmount !== elements.length) {
      this.elementsAmount = elements.length;
      this.addButtonsToInputs();
    }
  }

  onTextSelected(event) {
    const selection = event.view.getSelection();
    if (selection && selection.toString().length > 0) {
      this.handleTextSelection(selection, event);
    } else {
      this.clearTextSelection();
    }
    this.changeDetectorRef.detectChanges();
  }
  
  private handleTextSelection(selection: Selection, event: any): void {
    this.selectedText = selection.toString();
    this.isTextSelected = true;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    this.centerSelectionInView(rect);

    // Espero a que termine el scroll para crear los botones con la posición final
    setTimeout(() => {
      const updatedRect = selection.getRangeAt(0).getBoundingClientRect();
      this.createButtons(updatedRect);
    }, 450);
    this.updateMetadataOptions(event);
  }

  /**
   * Centra la selección de texto en el visor de PDF
   * @param rect Rectángulo que contiene la selección de texto
   */
  private centerSelectionInView(rect: DOMRect): void {
    if (!this.iframe || !this.iframe.contentWindow) return;
    
    const viewerContainer = this.iframe.contentWindow.document.getElementById('viewerContainer');
    if (!viewerContainer) return;
    
    const containerHeight = viewerContainer.clientHeight;
    const selectionTop = rect.top + viewerContainer.scrollTop - this.iframe.getBoundingClientRect().top;
    const selectionHeight = rect.height;
    const targetScrollTop = selectionTop - (containerHeight / 2) + (selectionHeight / 2);
    
    viewerContainer.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }
  
  private clearTextSelection(): void {
    this.selectedText = '';
    this.isTextSelected = false;
    this.showDynamicInputs = false;
    this.removeButtons();
  }
  
  private updateMetadataOptions(event: any): void {
    const elements = this.getFormElements();
    const excludedIds = MetadataConfig.EXCLUDED_IDS;
    const uniqueIdParts = new Set<string>();
    const nameMap = MetadataConfig.NAME_MAP;
    const visibleElements = elements.filter(element => 
      window.getComputedStyle(element).visibility === 'visible' && element.id);
    
    setTimeout(() => {
      this.metadataOptions = this.filterAndMapElements(visibleElements, excludedIds, uniqueIdParts, nameMap);
    }, 100);
  }
  
  private getFormElements(): HTMLElement[] {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    const inputs = Array.from(document.querySelectorAll('input'));
    return [...textareas, ...inputs] as HTMLElement[];
  }
  
  private filterAndMapElements(
    elements: HTMLElement[], 
    excludedIds: Set<string>, 
    uniqueIdParts: Set<string>,
    nameMap: Record<string, string>
  ): Array<{name: string, value: string}> {
    return elements
      .filter(element => this.shouldIncludeElement(element, excludedIds))
      .filter(element => this.isUniqueMetadataId(element, uniqueIdParts))
      .map(element => ({
        name: nameMap[element.id] || element.getAttribute('placeholder') || element.getAttribute('name') || element.id,
        value: element.id
      }));
  }
  
  private shouldIncludeElement(element: HTMLElement, excludedIds: Set<string>): boolean {
    return !excludedIds.has(element.id) && 
           !element.id.match(/^primaryBitstream\d+$/) && 
           !element.id.match(/^inputFileUploader-ds-drag-and-drop-uploader\d+$/) && 
           !element.id.match(/^SL_locer\d+$/) && 
           !element.id.match(/^SL_BBL_locer\d+$/);
  }
  
  private isUniqueMetadataId(element: HTMLElement, uniqueIdParts: Set<string>): boolean {
    const match = element.id.match(/(dc|sedici|mods|thesis).*/);
    const idPart = match ? match[0] : element.id;
    if (uniqueIdParts.has(idPart)) {
      return false;
    } else {
      uniqueIdParts.add(idPart);
      return true;
    }
  }

  createButtons(rect: DOMRect): void {
    this.ngZone.run(() => {
      this.removeButtons();
      const componentRef = this.createButtonComponent();
      this.configureButtonComponent(componentRef, rect);
      this.buttonComponents.push(componentRef);
      this.changeDetectorRef.detectChanges();
    });
  }
  
  private createButtonComponent(): ComponentRef<ShortcutsButtonsComponent> {
    const factory = this.componentFactoryResolver.resolveComponentFactory(ShortcutsButtonsComponent);
    return this.viewContainerRef.createComponent(factory);
  }
  
  private configureButtonComponent(componentRef: ComponentRef<ShortcutsButtonsComponent>, rect: DOMRect): void {
    componentRef.instance.rect = rect;
    componentRef.instance.buttonClicked.subscribe((event: { idElement: string, multiple: boolean }) => {
      this.handleButtonClicked(event.idElement, event.multiple);
    });
  }
  
  handleButtonClicked(idElement: string, multiple: boolean) {
    this.selectedMetadataField = idElement;
    const element = document.getElementById(this.selectedMetadataField) as HTMLTextAreaElement | HTMLInputElement;
    
    if (multiple) {
      this.handleMultipleSelection(element);
    } else {
      this.handleSingleSelection(element);
    }
    
    this.removeButtons();
  }
  
  private handleMultipleSelection(element: HTMLTextAreaElement | HTMLInputElement): void {
    if (this.selectedMetadataField === 'sedici_creator_person') {
      const authors = filterTransformer.transformPersons(this.selectedText);
      this.processRepeatableMetadata(authors);
    } else {
      const keywords = filterTransformer.transformKeywords(this.selectedText);
      this.processRepeatableMetadata(keywords);
    }
  }
  
  private handleSingleSelection(element: HTMLTextAreaElement | HTMLInputElement): void {
    if (this.selectedMetadataField === 'sedici_creator_person') {
      const author = filterTransformer.transformPerson(this.selectedText);
      this.processRepeatableMetadata([author]);
    } else if (this.selectedMetadataField === 'dc_subject') {
      const keyword = filterTransformer.transformKeyword(this.selectedText);
      this.processRepeatableMetadata([keyword]);
    } else {
      this.setMetadataValue(element, this.selectedText, true);
    }
  }
  
  removeButtons(): void {
    this.buttonComponents.forEach(componentRef => componentRef.destroy());
    this.buttonComponents = [];
  }

  copyToMetadataField() {
    if (!this.selectedMetadataField) {
      alert('Selecciona una caja de texto.');
      return;
    }
    
    const idPart = this.extractIdPart();
    
    if (this.showDynamicInputs) {
      this.retrieveInputs();
    } else if (idPart.includes('date')) {
      this.processDateMetadata();
    } else if (idPart === 'sedici_relation_journalVolumeAndIssue') {
      this.processJournalMetadata();
    } else if (this.isRepeatableMetadataName(idPart) || 
              (this.isRepeatableAndExtensibleMetadataName(idPart) && this.replaceText)) {
      this.processRepeatableMetadata([this.selectedText]);
    } else if (this.isRepeatableAndExtensibleMetadataName(idPart) && !this.replaceText) {
      this.processExtensibleMetadata();
    } else {
      this.processStandardMetadata();
    }
    
    this.clearSelection();
  }
  
  private processDateMetadata(): void {
    const date = new DateSplitter().split(this.selectedText.trim());
    const metadataYear = document.getElementById(this.selectedMetadataField) as HTMLTextAreaElement | HTMLInputElement;
    const metadataMonth = document.getElementById(this.selectedMetadataField.replace(/_year$/, '_month')) as HTMLTextAreaElement | HTMLInputElement;
    const metadataDay = document.getElementById(this.selectedMetadataField.replace(/_year$/, '_day')) as HTMLTextAreaElement | HTMLInputElement;
    
    if (date.year) {
      this.setMetadataValue(metadataYear, date.year, true);
      if (date.month) {
        this.setMetadataValue(metadataMonth, date.month, true);
        if (date.day) {
          this.setMetadataValue(metadataDay, date.day, true);
        }
      }
    }
  }
  
  private processJournalMetadata(): void {
    const elements = document.querySelectorAll(`[id*="${this.selectedMetadataField}"]`);
    const element = Array.from(elements).find(el => 
      window.getComputedStyle(el).visibility === 'visible' &&
      el.getAttribute('id').startsWith('label') === false
    ) as HTMLTextAreaElement | HTMLInputElement;
    
    const journalData = new VolumeIssueSplitter().split(this.selectedText);
    let formattedText = '';
    
    if (journalData.volume) {
      formattedText = journalData.issue 
        ? `vol. ${journalData.volume}, no. ${journalData.issue}` 
        : `vol. ${journalData.volume}`;
    } else if (journalData.year) {
      formattedText = journalData.issue 
        ? `año ${journalData.year}, no. ${journalData.issue}` 
        : `año ${journalData.year}`;
    } else if (journalData.tomo) {
      formattedText = journalData.issue 
        ? `tomo ${journalData.tomo}, no. ${journalData.issue}` 
        : `tomo ${journalData.tomo}`;
    } else if (journalData.issue) {
      formattedText = `no. ${journalData.issue}`;
    } else {
      alert('No se encontraron año, volumen, tomo o número');
      return;
    }
    
    this.setMetadataValue(element, formattedText, true);
  }
  
  private processExtensibleMetadata(): void {
    const idPart = this.extractIdPart();
    const elementsWithSameId = Array.from(document.querySelectorAll(`[id*="${idPart}"]`))
      .filter(element => window.getComputedStyle(element).visibility === 'visible');
    const element = elementsWithSameId[elementsWithSameId.length - 1] as HTMLTextAreaElement | HTMLInputElement;
    this.setMetadataValue(element, this.selectedText, false);
  }
  
  private processStandardMetadata(): void {
    const elements = document.querySelectorAll(`[id*="${this.selectedMetadataField}"]`);
    const element = Array.from(elements).find(el => 
      window.getComputedStyle(el).visibility === 'visible' &&
      el.getAttribute('id').startsWith('label') === false
    ) as HTMLTextAreaElement | HTMLInputElement;
    
    this.setMetadataValue(element, this.selectedText);
  }

  extractIdPart(): string {
    const match = this.selectedMetadataField.match(/(dc|sedici|mods|thesis).*/);
    return match ? match[0] : this.selectedMetadataField;
  }
  
  isRepeatableMetadataName(name: string): boolean {
    return this.repeatableMetadata.includes(name);
  }
  
  isRepeatableAndExtensibleMetadataName(name: string): boolean {
    return this.repeatableAndExtensibleMetadata.includes(name);
  }
  
  clearSelection() {
    this.selectedText = '';
    this.isTextSelected = false;
    this.selectedMetadataField = '';
    this.removeButtons();
  }
  
  async addMetadataField(selectedMetadataField: string = this.selectedMetadataField): Promise<void> {
    const selectedInput = document.getElementById(selectedMetadataField);
    if (!selectedInput) {
      console.error('Input seleccionado no encontrado.');
      return;
    }
    
    const metadataContainer = selectedInput.closest('div[id$="_array"]');
    if (!metadataContainer) {
      console.error('Contenedor no encontrado.');
      return;
    }
    
    const addButton = metadataContainer.querySelector('.ds-form-add-more.btn.btn-link') as HTMLElement;
    if (!addButton) {
      console.error(`Botón "Añadir más" no encontrado en el contenedor con id ${metadataContainer.id}.`);
      return;
    }
    
    addButton.click();
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  async processRepeatableMetadata(
    items: string[], 
    idPart: string = this.extractIdPart(), 
    selectedMetadataField: string = this.selectedMetadataField
  ): Promise<void> {
    for (const item of items) {
      const elementsWithSameId = this.getVisibleElementsWithId(idPart);
      let element = this.findEmptyElement(elementsWithSameId);
      
      if (!element) {
        await this.addMetadataField(selectedMetadataField);
        const newElementsWithSameId = this.getVisibleElementsWithId(idPart);
        element = newElementsWithSameId[newElementsWithSameId.length - 1] as HTMLTextAreaElement | HTMLInputElement;
      }
      
      this.setMetadataValue(element, item, false);
    }
  }
  
  private getVisibleElementsWithId(idPart: string): Array<HTMLTextAreaElement | HTMLInputElement> {
    return Array.from(document.querySelectorAll(`[id*="${idPart}"]`))
      .filter(element => {
        const id = element.getAttribute('id');
        return id === idPart || id.endsWith(idPart);
      })
      .filter(element => window.getComputedStyle(element).visibility === 'visible') as Array<HTMLTextAreaElement | HTMLInputElement>;
  }
  
  private findEmptyElement(elements: Array<HTMLTextAreaElement | HTMLInputElement>): HTMLTextAreaElement | HTMLInputElement | null {
    let index = 0;
    let element = elements[index];
    
    while (element && element.value) {
      element = elements[++index];
    }
    
    return element || null;
  }

  setMetadataValue(
    element: HTMLTextAreaElement | HTMLInputElement, 
    value: string, 
    replaceText: boolean = this.replaceText
  ): void {
    if (!element || value === '') {
      alert(`Elemento con ID ${element?.id || 'desconocido'} no encontrado. O valor no válido.`);
      return;
    }
    
    element.focus();
    this.modifiedFieldStyle(element);
    
    // Actualizar el valor
    if (!element.value || replaceText) {
      element.value = value;
    } else {
      element.value = element.value + '\n' + value;
    }
  
    // Disparar eventos para notificar cambios
    this.triggerDOMEvents(element);
  }
  
  private triggerDOMEvents(element: HTMLTextAreaElement | HTMLInputElement): void {
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
    const changeEvent = new Event('change', { bubbles: true });
    element.dispatchEvent(changeEvent);
    this.changeDetectorRef.detectChanges();
  }
  
  modifiedFieldStyle(element: HTMLTextAreaElement | HTMLInputElement) {
    element.style.border = '2px solid green';
    setTimeout(() => {
      element.style.border = '';
    }, 5000);
  }

  createInputs(parts: string[]): void {
    const container = document.getElementById('inputsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    parts.forEach((part, index) => {
      const inputGroup = this.createInputGroup(part, index, container);
      container.appendChild(inputGroup);
    });
    
    const removeAllButton = this.createRemoveAllButton(container);
    container.insertAdjacentElement('afterend', removeAllButton);
  }
  
  private createInputGroup(part: string, index: number, container: HTMLElement): HTMLElement {
    const inputGroup = document.createElement('div');
    inputGroup.classList.add('dynamic-input-group');
  
    const input = document.createElement('input');
    input.type = 'text';
    input.value = part;
    input.id = `input-${index}`;
    input.classList.add('dynamic-input');
  
    const removeButton = document.createElement('button');
    removeButton.innerText = 'x';
    removeButton.classList.add('dynamic-remove-button');
    removeButton.addEventListener('click', () => this.handleRemoveInput(inputGroup, container));
  
    inputGroup.appendChild(input);
    inputGroup.appendChild(removeButton);
    
    return inputGroup;
  }
  
  private handleRemoveInput(inputGroup: HTMLElement, container: HTMLElement): void {
    container.removeChild(inputGroup);
    const inputs = document.querySelectorAll('.dynamic-input');
    if (inputs.length === 0) {
      const removeAllButton = document.querySelector('.dynamic-remove-all-button');
      if (removeAllButton) removeAllButton.remove();
      this.showDynamicInputs = false;
    }
  }
  
  private createRemoveAllButton(container: HTMLElement): HTMLElement {
    const removeAllButton = document.createElement('button');
    removeAllButton.innerText = 'Eliminar todos';
    removeAllButton.classList.add('dynamic-remove-all-button');
    removeAllButton.addEventListener('click', () => {
      const inputs = document.querySelectorAll('.dynamic-input-group');
      inputs.forEach(inputGroup => {
        container.removeChild(inputGroup);
      });
      removeAllButton.remove();
      this.showDynamicInputs = false;
    });
    
    return removeAllButton;
  }
  
  clearDynamicInputs(): void {
    this.showDynamicInputs = false;
    const container = document.getElementById('inputsContainer');
    if (container) container.innerHTML = '';
  }
  
  async retrieveInputs(): Promise<void> {
    const inputs = document.querySelectorAll('.dynamic-input');
    const idPart = this.extractIdPart();
    const selectedMetadataField = this.selectedMetadataField;
    
    for (const input of Array.from(inputs)) {
      const element = input as HTMLTextAreaElement | HTMLInputElement;
      await this.processRepeatableMetadata([element.value], idPart, selectedMetadataField);
    }
    
    this.showDynamicInputs = false;
    this.selectedText = '';
    this.isTextSelected = false;
  }

  applyFilter(filter: string, text: string = this.selectedText): string {
    if (this.showDynamicInputs) {
      return this.applyFilterToDynamicInputs(filter);
    } else if (this.applyFilterToSubmissionField) {
      this.applyFilterToSubmissionField = false;
      return this.applyFilterToText(text, filter);
    } else {
      this.selectedText = this.applyFilterToText(text, filter);
      return this.selectedText;
    }
  }
  
  private applyFilterToDynamicInputs(filter: string): string {
    const inputs = document.querySelectorAll('.dynamic-input');
    inputs.forEach((input) => {
      const element = input as HTMLTextAreaElement | HTMLInputElement;
      element.value = this.applyFilterToText(element.value, filter);
      if (element.value === '') {
        element.parentElement?.remove();
      }
    });
    return '';
  }
  
  applyFilterToText(text: string, filter: string): string {
    switch (filter) {
      case 'camelCase':
        return filterTransformer.toCamelCase(text);
      case 'upperCase':
        return filterTransformer.toUpperCase(text);
      case 'lowerCase':
        return filterTransformer.toLowerCase(text);
      case 'capitalize':
        return filterTransformer.toCapitalize(text);
      case 'splitByDelimiter':
        return this.handleSplitByDelimiter(text);
      case 'removeDoubleSpaces':
        return filterTransformer.removeDoubleSpaces(text);
      case 'removeSpacesBetweenLetters':
        return filterTransformer.removeSpacesBetweenLetters(text);
      case 'removeSpacesAtStartAndEnd':
        return filterTransformer.removeSpacesAtStartAndEnd(text);
      case 'removeLineBreaks':
        return filterTransformer.removeLineBreaks(text);
      case 'removeTitles':
        return filterTransformer.removeTitles(text);
      case 'removeReferences':
        return filterTransformer.removeReferences(text);
      case 'reorderPerson':
        return this.handleReorderPerson(text);
      default:
        return text;
    }
  }
  
  private handleSplitByDelimiter(text: string): string {
    const parts = filterTransformer.splitByDelimiter(text);
    this.showDynamicInputs = true;
    this.changeDetectorRef.detectChanges();
    this.createInputs(parts);
    return text;
  }
  
  private handleReorderPerson(text: string): string {
    const result = filterTransformer.reorderPerson(text);
    if (!result) {
      alert('El filtro solo se puede aplicar cuando se tiene UN nombre y UN apellido.');
      return text;
    }
    return result;
  }

  initializeButtons(): void {
    this.addButtonsToInputs();
  }
  
  addButtonsToInputs(): void {
    this.removeFiltersButtons();
    const elements = this.getFormElements();
    const filteredElements = this.filterFormElements(elements);
    
    this.applyButtonsToElements(filteredElements);
  }
  
  private filterFormElements(elements: HTMLElement[]): HTMLElement[] {
    const excludedIds = MetadataConfig.EXCLUDED_IDS_FOR_BUTTONS;
    const uniqueId = new Set();
    
    return elements
      .filter(element => window.getComputedStyle(element).visibility === 'visible')
      .filter(element => element.id)
      .filter(element => !excludedIds.has(element.id) && 
                       !element.id.match(/^primaryBitstream\d+$/) && 
                       !element.id.match(/^inputFileUploader-ds-drag-and-drop-uploader\d+$/) && 
                       !element.id.match(/^SL_locer\d+$/) && 
                       !element.id.match(/^SL_BBL_locer\d+$/))
      .filter(element => {
        if (uniqueId.has(element.id)) return false;
        uniqueId.add(element.id);
        return true;
      });
  }
  
  private applyButtonsToElements(elements: HTMLElement[]): void {
    const escapeSelector = (id: string): string => {
      return id.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
    };
    
    // Actualizar opciones de metadatos para la vista
    this.metadataOptions = elements.map(element => ({
      name: element.getAttribute('placeholder') || element.getAttribute('name') || element.id,
      value: element.id
    }));
    
    // Seleccionar todos los inputs basados en las opciones filtradas
    const selector = this.metadataOptions
      .map(option => `[id="${escapeSelector(option.value)}"]`)
      .join(', ');
    const inputs = document.querySelectorAll(selector);
    
    // Aplicar botones a cada input
    inputs.forEach(input => this.attachButtonToInput(input as HTMLElement));
  }
  
  private attachButtonToInput(input: HTMLElement): void {
    if (!input.id) return;
    
    const parent = input.closest('.col') || input.closest('ds-dynamic-form-control-container');
    if (!parent) return;
    
    let container: HTMLElement | null = null;
    
    // Si es un contenedor de columna completa, crear un contenedor flex
    if (parent.classList.contains('col-sm-12')) {
      container = document.createElement('div');
      container.classList.add('d-flex', 'align-items-center', 'w-100');
      container.style.gap = '8px';
      
      input.classList.add('flex-grow-1');
      input.parentNode!.insertBefore(container, input);
      container.appendChild(input);
    }
    
    // Crear y configurar el componente de botón desplegable
    const factory = this.componentFactoryResolver.resolveComponentFactory(DynamicButtonDropdownComponent);
    const componentRef = this.viewContainerRef.createComponent(factory);
    
    componentRef.instance.filterApplied.subscribe((filter: string) => {
      this.applyFilterToSubmissionField = true;
      const newValue = this.applyFilter(filter, (input as HTMLInputElement).value);
      this.setMetadataValue(input as HTMLInputElement, newValue, true);
    });
    
    // Insertar el botón en el DOM
    if (container) {
      container.appendChild(componentRef.location.nativeElement);
    } else {
      parent.insertAdjacentElement('afterend', componentRef.location.nativeElement);
    }
  }
  
  removeFiltersButtons(): void {
    const buttons = document.querySelectorAll('app-dynamic-button-dropdown');
    buttons.forEach((button) => button.remove());
  }
  
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}