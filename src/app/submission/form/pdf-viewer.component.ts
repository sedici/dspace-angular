import { Component, Input, ViewChild, ChangeDetectorRef, NgZone, ComponentRef, AfterViewInit, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
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
    NgClass,
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
  filterAutomatically: boolean = true;
  concatenateText: boolean = false;
  
  // Configuración de metadatos
  metadataFormOptions = [];
  metadataOptions = [];
  repeatableMetadata: string[] = MetadataConfig.REPEATABLE_METADATA;
  peopleMetadata: string[] = MetadataConfig.PEOPLE_METADATA;

  // Estado de elementos dinámicos
  showDynamicInputs: boolean = false;
  isDropdownOpen = false;
  applyFilterToSubmissionField: boolean = false;
  private mutationObserver: MutationObserver | null = null;
  private fieldButtonMap = new Map<string, ComponentRef<DynamicButtonDropdownComponent>>();
  private globalIdCounters = new Map<string, number>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private ngZone: NgZone,
    private formOperationsService: SectionFormOperationsService
  ) { }

  ngAfterViewInit() {
    this.syncButtonsWithFields();
    this.interceptFormOperationChanges();
    this.setupMutationObserver();
  }

  ngOnDestroy() {
    this.resetButtonCounters();    
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
  }

  private resetButtonCounters(): void {
    this.globalIdCounters.clear();
    this.fieldButtonMap.clear();

    const elementsWithKeys = document.querySelectorAll('[data-unique-key]');
    elementsWithKeys.forEach(element => {
      element.removeAttribute('data-unique-key');
    });
  }

  private interceptFormOperationChanges(): void {
    const originalDispatch = this.formOperationsService.dispatchOperationsFromChangeEvent;
    this.formOperationsService.dispatchOperationsFromChangeEvent = 
      (pathCombiner: JsonPatchOperationPathCombiner, event: any, previousValue: any, hasStoredValue: boolean) => {
        if (event?.model?.id === 'dc_type' || event?.model?.id === 'sedici_subtype') {
          setTimeout(() => {
            this.syncButtonsWithFields();
          }, 500);
        }
        return originalDispatch.call(this.formOperationsService, pathCombiner, event, previousValue, hasStoredValue);
    };
  }

  private addFocusTrackingToInput(element: HTMLElement): void {
    element.addEventListener('focus', (event) => {
      const targetId = (event.target as HTMLTextAreaElement | HTMLInputElement).id;
      const excludedIds = MetadataConfig.EXCLUDED_IDS;
      // Evito el focus en la caja de previsualización de texto y en los campos deplegables
      if (!excludedIds.has(targetId) && !targetId.includes('input-')) {
        this.selectedMetadataField = targetId;
      }
    });
  }

  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver((mutations) => {
      let hasRelevantChanges = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Verificar si se agregaron o eliminaron campos de formulario
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (this.isFormField(element)) {
                hasRelevantChanges = true;
              }
            }
          });
          
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (this.isFormField(element)) {
                hasRelevantChanges = true;
                this.cleanupOrphanedButtons(element);
              }
            }
          });
        }
      });
      
      if (hasRelevantChanges) {
        this.debounceUpdateButtons();
      }
    });

    const formContainer = document.body;
    this.mutationObserver.observe(formContainer, {
      childList: true,
      subtree: true
    });
  }

  private isFormField(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'ds-dynamic-onebox' || tagName === 'dynamic-ng-bootstrap-textarea' || tagName === 'dynamic-ng-bootstrap-input';
  }

  private debounceTimer: any;
  private debounceUpdateButtons(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.syncButtonsWithFields();
    }, 100);
  }

  private syncButtonsWithFields(): void {
    const currentFields = this.getCurrentFormFields();
    const currentFieldKeys = new Set(currentFields.map(field => field.getAttribute('data-unique-key')));
    
    // 1. Eliminar botones huérfanos
    this.removeOrphanedButtons(currentFieldKeys);
    
    // 2. Agregar botones a campos nuevos
    this.addButtonsToNewFields(currentFields);
    
    // 3. Actualizar opciones de metadatos
    this.updateMetadataOptions(currentFields);
  }

  private removeOrphanedButtons(currentFieldKeys: Set<string>): void {
    const orphanedKeys: string[] = [];
    
    this.fieldButtonMap.forEach((componentRef, fieldKey) => {
      if (!currentFieldKeys.has(fieldKey)) {
        componentRef.destroy();
        orphanedKeys.push(fieldKey);
      }
    });
    
    orphanedKeys.forEach(key => this.fieldButtonMap.delete(key));
  }

  private addButtonsToNewFields(currentFields: HTMLElement[]): void {
    const excludedIds = MetadataConfig.EXCLUDED_IDS_FOR_BUTTONS;
    currentFields = currentFields
      .filter(element => !excludedIds.has(element.id))

    currentFields.forEach(field => {
      const uniqueKey = field.getAttribute('data-unique-key');
      if (uniqueKey && !this.fieldButtonMap.has(uniqueKey)) {
        this.createButtonForField(field);
      }
    });
  }

  private createButtonForField(input: HTMLElement): void {
    if (!input.id) return;
    
    const uniqueKey = input.getAttribute('data-unique-key');
    if (!uniqueKey) return;
    
    const parent = input.closest('.col') || input.closest('ds-dynamic-form-control-container');
    if (!parent) return;
    
    const existingButton = parent.querySelector(`app-dynamic-button-dropdown[data-field-key="${uniqueKey}"]`);
    if (existingButton) {
      return;
    }

    // Crear contenedor flex si es necesario
    let container: HTMLElement | null = null;
    if (parent.classList.contains('col-sm-12')) {
      container = this.createFlexContainer(input);
    }

    // Crear componente de botón
    const componentRef = this.createButtonComponentt(input);
    
    componentRef.location.nativeElement.setAttribute('data-field-key', uniqueKey);
    
    // Guardar en el mapa con la clave única
    this.fieldButtonMap.set(uniqueKey, componentRef);
    
    // Insertar en DOM
    if (container) {
      container.appendChild(componentRef.location.nativeElement);
    } else {
      parent.insertAdjacentElement('afterend', componentRef.location.nativeElement);
    }
  }

  private createFlexContainer(input: HTMLElement): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('d-flex', 'align-items-center', 'w-100');
    container.style.gap = '8px';
    
    input.classList.add('flex-grow-1');
    input.parentNode!.insertBefore(container, input);
    container.appendChild(input);
    
    return container;
  }

  private createButtonComponentt(input: HTMLElement): ComponentRef<DynamicButtonDropdownComponent> {
    const factory = this.componentFactoryResolver.resolveComponentFactory(DynamicButtonDropdownComponent);
    const componentRef = this.viewContainerRef.createComponent(factory);

    const match = input.id.match(/(dc|sedici|mods|thesis).*/);
    componentRef.instance.inputID = match ? match[0] : input.id;
    
    componentRef.instance.filterApplied.subscribe((filter: string) => {
      this.applyFilterToSubmissionField = true;
      const newValue = this.applyFilter(filter, (input as HTMLInputElement).value);
      this.setMetadataValue(input as HTMLInputElement, newValue);
    });
    
    return componentRef;
  }

  private getCurrentFormFields(): HTMLElement[] {
    const formContainers = document.querySelectorAll('ds-dynamic-form-control-container');
    const fields: HTMLElement[] = [];
    const excludedIds = MetadataConfig.EXCLUDED_IDS;

    formContainers.forEach((container) => {
      const inputs = Array.from(container.querySelectorAll('input, textarea'))
      .filter((input): input is HTMLElement => input instanceof HTMLElement)
      .filter(input => input.id)
      .filter(input => window.getComputedStyle(input).visibility === 'visible')
      .filter(input => !excludedIds.has(input.id) && 
                       !input.id.match(/^primaryBitstream\d+$/) && 
                       !input.id.match(/^inputFileUploader-ds-drag-and-drop-uploader\d+$/) && 
                       !input.id.match(/^SL_locer\d+$/) && 
                       !input.id.match(/^SL_BBL_locer\d+$/) &&
                       input.id !== 'cc-license-dropdown' &&
                       !(input.id).includes('input-'))

      inputs.forEach((input) => {
        if (input.id) {
          const element = input as HTMLElement;
          let uniqueKey = element.getAttribute('data-unique-key');
          if (!uniqueKey) {
            const currentCount = this.globalIdCounters.get(element.id) || 0;
            this.globalIdCounters.set(element.id, currentCount + 1);
            uniqueKey = this.generateUniqueKey(element, currentCount + 1);
            element.setAttribute('data-unique-key', uniqueKey);
            this.addFocusTrackingToInput(element);
          }
          fields.push(element);
        }
      });
    });
        
    return fields;
  }

  private generateUniqueKey(element: HTMLElement, globalInstanceIndex: number): string {
    return `${element.id}-instance-${globalInstanceIndex}`;
  }

  private cleanupOrphanedButtons(removedElement: Element): void {
    const inputs = removedElement.querySelectorAll('input[data-unique-key], textarea[data-unique-key]');
    inputs.forEach(input => {
      const uniqueKey = input.getAttribute('data-unique-key');
      if (uniqueKey && this.fieldButtonMap.has(uniqueKey)) {
        const componentRef = this.fieldButtonMap.get(uniqueKey);
        componentRef?.destroy();
        this.fieldButtonMap.delete(uniqueKey);
      }
    });
  }

  private updateMetadataOptions(elements: HTMLElement[]): void {
    const uniqueId = new Set();
    const nameMap = MetadataConfig.NAME_MAP;
    
    this.metadataOptions = elements
    .filter(input => {
        if (uniqueId.has(input.id)) return false;
        uniqueId.add(input.id);
        return true;
      })
    .map(element => ({
      name: nameMap[element.id] || element.getAttribute('placeholder') || element.getAttribute('name') || element.id,
      value: element.id
    }));
  }

  public pagesLoadedEvent(): void {
    this.iframe = this.pdfViewerOnDemand.iframe.nativeElement;
    this.container = this.iframe.contentDocument.body;
    const pdfApp = this.iframe.contentWindow?.PDFViewerApplication;
    pdfApp.appConfig.viewerContainer.onmouseup = this.onTextSelected.bind(this);
  }

  onTextSelected(event) {
    const selection = event.view.getSelection();
    if (selection && selection.toString().length > 0) {
      this.handleTextSelection(selection, event);
    } else {
      this.clearTextSelection();
      this.showDynamicInputs = false;
    }
    this.changeDetectorRef.detectChanges();
  }
  
  private handleTextSelection(selection: Selection, event: any): void {
    let selectionToString = selection.toString();
    if (this.filterAutomatically) {
      selectionToString = filterTransformer.cleanText(selectionToString);
      if (this.concatenateText) {
        selectionToString = this.selectedText + ' ' + selectionToString;
        this.concatenateText = false;
      }
      if (this.selectedMetadataField !== '') {
        const idPart = this.extractIdPart();
        if (this.peopleMetadata.includes(idPart)) {
          const parts = filterTransformer.transformPersons(selectionToString);
          if (parts.length > 1) {
            this.showDynamicInputs = true;
            this.changeDetectorRef.detectChanges();
            setTimeout(() => {
              this.createInputs(parts);
            }, 100);
            this.selectedText = selectionToString;
          } else {
            this.selectedText = parts[0];
          }
        } else if (idPart === 'dc_subject') {
          const parts = filterTransformer.transformKeywords(selectionToString);
          if (parts.length > 1) {
            this.showDynamicInputs = true;
            this.changeDetectorRef.detectChanges();
            setTimeout(() => {
              this.createInputs(parts);
            }, 100);
            this.selectedText = selectionToString;
          } else {
            this.selectedText = parts[0];
          }
        } else if (idPart === 'sedici_relation_journalVolumeAndIssue') {
          this.selectedText = this.processJournalMetadata(selectionToString);
        } else if (idPart.includes('date')) {
          this.selectedText = this.processDateMetadata(selectionToString);
        } else {
          this.selectedText = selectionToString;
        }
      } else {
        this.selectedText = selectionToString;
      }
    } else {
      if (this.concatenateText) {
        selectionToString = this.selectedText + ' ' + selectionToString;
        this.concatenateText = false;
      }
      this.selectedText = selectionToString;
    }

    this.isTextSelected = true;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    this.centerSelectionInView(rect);

    // Espero a que termine el scroll para crear los botones con la posición final
    setTimeout(() => {
      const updatedRect = selection.getRangeAt(0).getBoundingClientRect();
      this.createButtons(updatedRect);
    }, 450);
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
  
  clearTextSelection(): void {
    this.selectedText = '';
    this.isTextSelected = false;
    this.concatenateText = false;
    this.removeButtons();
  }

  changeFilterAutomatically(): void {
    this.filterAutomatically = !this.filterAutomatically;
  }

  changeConcatenateText(): void {
    this.concatenateText = !this.concatenateText;
  }
  
  private getFormElements(): HTMLElement[] {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    const inputs = Array.from(document.querySelectorAll('input'));
    return [...textareas, ...inputs] as HTMLElement[];
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
    componentRef.instance.onButtonClick = () => {
      this.copyToMetadataField();
    };
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
    const text = this.selectedText.trim();
    
    if (this.showDynamicInputs) {
      this.retrieveInputs();
    } else if (idPart.includes('date')) {
      this.saveDateMetadata();
    } else if (this.isRepeatableMetadataName(idPart)) {
      this.processRepeatableMetadata([text]);
    } else {
      this.processStandardMetadata();
    }
    
    this.removeButtons();
    this.clearTextSelection();
    this.selectedMetadataField = '';
  }
  
  private processDateMetadata(selectedText: string): string {
    const date = new DateSplitter().split(selectedText);
    let formattedText = '';

    if (date.year) {
      if (date.day && date.month) {
        // Formato completo: "DIA del MES del AÑO"
        formattedText = `Día: ${date.day}\nMes: ${date.month}\nAño: ${date.year}`;
      } else if (date.month) {
        // Solo mes y año: "MES del AÑO"
        formattedText = `Mes: ${date.month}\nAño: ${date.year}`;
      } else {
        // Solo año: "AÑO"
        formattedText = `Año: ${date.year}`;
      }
      return formattedText;
    } else {
      alert('No se encontró un formato de fecha válido');
      return selectedText;
    }
  }

  private saveDateMetadata(): void {
    let day = '';
    let month = '';
    let year = '';

    // Extraer año (4 dígitos después de "Año: ")
    const yearMatch = this.selectedText.match(/Año:\s*(\d{4})/);
    if (yearMatch) {
      year = yearMatch[1];
    }

    // Extraer mes (1-2 dígitos después de "Mes: ")
    const monthMatch = this.selectedText.match(/Mes:\s*(\d{1,2})/);
    if (monthMatch) {
      month = monthMatch[1];
    }

    // Extraer día (1-2 dígitos después de "Día: ")
    const dayMatch = this.selectedText.match(/Día:\s*(\d{1,2})/);
    if (dayMatch) {
      day = dayMatch[1];
    }

    // Si no hay ninguno de los tres, usar DateSplitter
    if (!year && !month && !day) {
      const date = new DateSplitter().split(this.selectedText.trim());
      day = date.day || '';
      month = date.month || '';
      year = date.year || '';
    }
    
    const metadataYear = document.getElementById(this.selectedMetadataField) as HTMLTextAreaElement | HTMLInputElement;
    const metadataMonth = document.getElementById(this.selectedMetadataField.replace(/_year$/, '_month')) as HTMLTextAreaElement | HTMLInputElement;
    const metadataDay = document.getElementById(this.selectedMetadataField.replace(/_year$/, '_day')) as HTMLTextAreaElement | HTMLInputElement;
    
    if (year) {
      this.setMetadataValue(metadataYear, year);
      if (month) {
        this.setMetadataValue(metadataMonth, month);
        if (day) {
          this.setMetadataValue(metadataDay, day);
        } else {
          metadataDay.value = '';
        }
      } else {
        metadataMonth.value = '';
        metadataDay.value = '';
      }
    }
  }
  
  private processJournalMetadata(selectedText: string): string {
    const journalData = new VolumeIssueSplitter().split(selectedText);
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
      return selectedText;
    }
    
    return formattedText;
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
      
      this.setMetadataValue(element, item);
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

  setMetadataValue(element: HTMLTextAreaElement | HTMLInputElement, value: string): void {
    if (!element || value === '') {
      alert(`Elemento con ID ${element?.id || 'desconocido'} no encontrado. O valor no válido.`);
      return;
    }
    
    element.focus();
    this.selectedMetadataField = '';
    this.modifiedFieldStyle(element);
    
    // Actualizar el valor
    element.value = value;
  
    // Disparar eventos para notificar cambios
    this.triggerDOMEvents(element);
    this.removeButtons();
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
    
    let removeAllButton = document.querySelector('.dynamic-remove-all-button');
    if (!removeAllButton) {
      removeAllButton = this.createRemoveAllButton(container);
    }
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

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}