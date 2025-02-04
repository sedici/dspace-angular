import { Component, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";

import { filterTransformer } from '../../../../zfilterTransformer/filterTransformer.js';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { AfterViewInit } from '@angular/core';

import { DynamicButtonDropdownComponent } from './dynamic-button-dropdown.component';
import { ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

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
	],
})
// export class PdfViewerComponent {
export class PdfViewerComponent implements AfterViewInit {

	@Input() pdfUrl: string;
	@ViewChild('pdfViewerOnDemand') pdfViewerOnDemand;
  iframe;
  container;
  pdfIsLoading = true;

	constructor(private changeDetectorRef: ChangeDetectorRef, private viewContainerRef: ViewContainerRef, private componentFactoryResolver: ComponentFactoryResolver) { }

  public pagesLoadedEvent(): void {
    this.iframe = this.pdfViewerOnDemand.iframe.nativeElement;
    this.container = this.iframe.contentDocument.body; // Contenedor del PDF
		const pdfApp = this.iframe.contentWindow?.PDFViewerApplication;
		pdfApp.appConfig.viewerContainer.onmouseup = this.onTextSelected.bind(this);
	}

	selectedText: string = '';
  isTextSelected: boolean = false;
  selectedTextarea: string = '';
  replaceText: boolean = false;
  metadataOptions = [];
  repeatableMetadata: string[] = [
    'sedici_identifier_isbn',
    'sedici_identifier_issn',
    'sedici_identifier_other',
    'sedici_identifier_uri',
    'sedici_creator_person',
    'sedici_creator_corporate',
    'sedici_creator_interprete',
    'sedici_contributor_colaborator',
    'sedici_contributor_translator',
    'sedici_contributor_editor',
    'sedici_contributor_compiler',
    'sedici_contributor_director',
    'sedici_contributor_codirector',
    'sedici_contributor_juror',
    'sedici_contributor_inscriber',
    'dc.title.alternative',
    'dc_format',
    'dc_format_extent',
    'dc_subject',
    'sedici_subject_materias',
    'sedici_subject_ford',
    // 'sedici_description_note',          // VER de sacar, porque puede ser tan largo que se agregue todo en la misma nota
    // 'dc_description_abstract',          // VER de sacar, porque puede ser tan largo que se agregue todo en el mismo resumen
    'sedici_institucionDesarrollo',
    'mods_originInfo_place',
    'mods_location',
    'sedici_relation_isRelatedWith',
    'dcterms_audience',
    'dc_coverage_spatial',
    'dc_coverage_temporal',
    'dc_description_filiation'
  ];

  repeatableAndExtensibleMetadata: string[] = [
    'sedici_description_note',
    'dc_description_abstract',
  ];

  // Este método se ejecuta al soltar el mouse
  onTextSelected(event) {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    const inputs = Array.from(document.querySelectorAll('input'));
    const elements = [...textareas, ...inputs];

    const excludedIds = new Set([
      // Se cargan a mano
      'selected-text',
      'dc_type',
      'sedici_subtype',
      'dc_language',
      'sedici_description_fulltext',
      'sedici_description_peerReview',

      // Se carga la fecha completa a partir del campo del año
      'dc_date_issued_month',
      'dc_date_issued_day',
      'dc_date_created_month',
      'dc_date_created_day',
      'sedici_date_exposure_month',
      'sedici_date_exposure_day',
    ]);
    const uniqueIdParts = new Set();

    this.metadataOptions = elements
      .filter(element => window.getComputedStyle(element).visibility === 'visible') // Filtrar elementos visibles
      .filter(element => element.id) // Filtrar elementos con id
      .filter(element => {
        // Excluir elementos específicos y aquellos que coinciden con el patrón (Bitstreams subidos, FileUploader y otros)
        return !excludedIds.has(element.id) && !element.id.match(/^primaryBitstream\d+$/) && !element.id.match(/^inputFileUploader-ds-drag-and-drop-uploader\d+$/) && !element.id.match(/^SL_locer\d+$/) && !element.id.match(/^SL_BBL_locer\d+$/);
      })
      .filter(element => {
        const match = element.id.match(/(dc|sedici|mods|thesis).*/); // Extraer la parte común del id
        const idPart = match ? match[0] : element.id;
        if (uniqueIdParts.has(idPart)) {
          return false; // Si el idPart ya está en el Set, filtrar el elemento (para que no haya repetidos)
        } else {
          uniqueIdParts.add(idPart); // Agregar el idPart al Set
          return true; // Mantener el elemento
        }
      })
      .map(element => {
        let name;
        switch (element.id) {
          case 'dc_date_issued_year':
            name = 'Fecha de publicación';
            break;
          case 'dc_date_created_year':
            name = 'Fecha de creación';
            break;
          case 'sedici_date_exposure_year':
            name = 'Fecha de presentación';
            break;
        default:
            name = element.placeholder || element.name || element.id;
        }
        return { name, value: element.id };
      });

    const selection = event.view.getSelection();
    if (selection && selection.toString().length > 0) {
      this.selectedText = selection.toString();
      this.isTextSelected = true;
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect(); // Coordenadas del texto seleccionado
      this.createButtons(rect); // Crear botones de acceso rápido
    } else {
      // Prueba estilo
      this.selectedText = '';
      // Fin prueba estilo

      // Prueba split y filters
      this.showDynamicInputs = false;
      // Fin prueba split y filters

      this.isTextSelected = false;
      this.removeButtons(this.container); // Borro los botones de acceso rápido
    }
		this.changeDetectorRef.detectChanges();
  }

  createButtons(rect: DOMRect): void {  
    this.removeButtons(this.container); // Eliminar botones existentes para evitar duplicados

    // Crear un contenedor para los botones
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');
    buttonGroup.style.position = 'absolute';

    const centerX = rect.left + (rect.width / 2); // Calcular la posición centrada horizontalmente

    // Ajustar la posición del contenedor de botones
    buttonGroup.style.left = `${centerX}px`;
    buttonGroup.style.top = `${rect.bottom}px`;
    buttonGroup.style.transform = 'translateX(-50%)'; // Centrar el contenedor en el eje X
    buttonGroup.style.zIndex = '1000';
    buttonGroup.style.display = 'flex'; // Estilo para alinear los botones horizontalmente
    buttonGroup.style.gap = '0px'; // Sin separación entre botones
  
    // Configuración de botones con sus acciones
    const buttonsConfig = [
      {
        label: 'T',
        action: () => {
          this.selectedTextarea = 'dc_title';
          const element = document.getElementById(this.selectedTextarea) as HTMLTextAreaElement | HTMLInputElement;
          this.setMetadataValue(element, this.selectedText, false);
          this.removeButtons(this.container);
        },
        color: '#00ff00' // Verde
      },
      {
        label: 'A',
        action: () => {
          this.selectedTextarea = 'sedici_creator_person';
          const author = filterTransformer.transformPerson(this.selectedText);
          this.processRepeatableMetadata([author]);
          this.removeButtons(this.container);
        },
        color: '#0000ff' // Azul
      },
      {
        label: 'As',
        action: () => {
          this.selectedTextarea = 'sedici_creator_person';
          const authors = filterTransformer.transformPersons(this.selectedText);
          this.processRepeatableMetadata(authors);
          this.removeButtons(this.container);
        },
        color: '#0000ff' // Azul
      },
      {
        label: 'PC',
        action: () => {
          this.selectedTextarea = 'dc_subject';
          const keyword = filterTransformer.transformKeyword(this.selectedText);
          this.processRepeatableMetadata([keyword]);
          this.removeButtons(this.container);
        },
        color: '#ff0000' // Rojo
      },
      {
        label: 'PCs',
        action: () => {
          this.selectedTextarea = 'dc_subject';
          const keywords = filterTransformer.transformKeywords(this.selectedText);
          this.processRepeatableMetadata(keywords);
          this.removeButtons(this.container);
        },
        color: '#ff0000' // Rojo
      }
    ];
  
    // Crear botones dinámicamente según la configuración
    buttonsConfig.forEach(config => {
      const button = document.createElement('button');
      button.classList.add('selection-button'); // Clase para identificar fácilmente
      button.innerText = config.label;
      button.style.backgroundColor = config.color; // Color definido en la configuración
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.padding = '5px 10px';
      button.style.cursor = 'pointer';
      button.style.flexGrow = '1'; // Asegura que los botones se alineen perfectamente
  
      button.addEventListener('click', config.action); // Agregar evento clic al botón
  
      buttonGroup.appendChild(button); // Agregar el botón al contenedor
    });
  
    this.container.appendChild(buttonGroup); // Agregar el grupo de botones al contenedor del visor
  }
  
  // Método para eliminar todos los botones
  removeButtons(container: HTMLElement): void {
    const buttonGroup = container.querySelector('.button-group');
    if (buttonGroup) {
      container.removeChild(buttonGroup);
    }
  }

  copyToTextarea() {
    if (this.selectedTextarea) {
      const idPart = this.extractIdPart();
      let element = document.getElementById(this.selectedTextarea) as HTMLTextAreaElement | HTMLInputElement;
      if (this.showDynamicInputs) {
        this.retrieveInputs();
      } else if (idPart.includes('date')) {
        const date = this.splitDate(this.selectedText);
        const metadataYear = document.getElementById(this.selectedTextarea) as HTMLTextAreaElement | HTMLInputElement;
        const metadataMonth = document.getElementById(this.selectedTextarea.replace(/_year$/, '_month')) as HTMLTextAreaElement | HTMLInputElement;
        const metadataDay = document.getElementById(this.selectedTextarea.replace(/_year$/, '_day')) as HTMLTextAreaElement | HTMLInputElement;
        if (date.year != '') { this.setMetadataValue(metadataYear, date.year, true); }
        if (date.month != '') { this.setMetadataValue(metadataMonth, date.month, true); }
        if (date.day != '') { this.setMetadataValue(metadataDay, date.day, true); }
      } else if (idPart === 'sedici_relation_journalVolumeAndIssue'){
        const journalVolumeAndIssue = this.splitVolumeIssueYear(this.selectedText);
        if (journalVolumeAndIssue.volume) {
          if(journalVolumeAndIssue.issue) {
            this.setMetadataValue(element, `vol. ${journalVolumeAndIssue.volume}, no. ${journalVolumeAndIssue.issue}`, true);
          }
          else {
            this.setMetadataValue(element, `vol. ${journalVolumeAndIssue.volume}`, true);
          }
        } else if (journalVolumeAndIssue.year) {
          if(journalVolumeAndIssue.issue) {
            this.setMetadataValue(element, `año ${journalVolumeAndIssue.year}, no. ${journalVolumeAndIssue.issue}`, true);
          }
          else {
            this.setMetadataValue(element, `año ${journalVolumeAndIssue.year}`, true);
          }
        } else if (journalVolumeAndIssue.issue) {
          this.setMetadataValue(element, `no. ${journalVolumeAndIssue.issue}`, true);
        } else {
          alert('No se encontraron año, volumen o número');
        }
      } else if (this.isRepeatableMetadataName(idPart) || (this.isRepeatableAndExtensibleMetadataName(idPart) && this.replaceText)) {
        this.processRepeatableMetadata([this.selectedText]);
      } else if (this.isRepeatableAndExtensibleMetadataName(idPart) && !this.replaceText) {
        const elementsWithSameId = Array.from(document.querySelectorAll(`[id*="${idPart}"]`))
          .filter(element => window.getComputedStyle(element).visibility === 'visible') // Filtrar elementos visibles
        element = elementsWithSameId[elementsWithSameId.length - 1] as HTMLTextAreaElement | HTMLInputElement; // Se agrega en el último campo
        this.setMetadataValue(element, this.selectedText, false);
      } else {
        this.setMetadataValue(element, this.selectedText);
      }
      this.clearSelection();
    } else {
      alert('Selecciona una caja de texto.');
    }
  }

  // Método para extraer el id del metadato seleccionado
  extractIdPart(): string {
    const match = this.selectedTextarea.match(/(dc|sedici|mods|thesis).*/); // Extraer la parte común del id (distintos inicios de metadatos)
    const idPart = match ? match[0] : this.selectedTextarea;
    return idPart;
  }

  // Método para verificar si un nombre de metadato está en la lista
  isRepeatableMetadataName(name: string): boolean {
    return this.repeatableMetadata.includes(name);
  }

  // Método para verificar si un nombre de metadato está en la lista
  isRepeatableAndExtensibleMetadataName(name: string): boolean {
    return this.repeatableAndExtensibleMetadata.includes(name);
  }

  // Método para agregar automáticamente un nuevo campo de metadato específico usando el id del contenedor
  async addMetadataField(selectedTextarea: string = this.selectedTextarea) {
    const selectedInput = document.getElementById(selectedTextarea); // Encuentra el input seleccionado usando su id
  
    if (selectedInput) {
      let metadataContainer = selectedInput.closest('div[id$="_array"]'); // Recorre el DOM hacia arriba hasta encontrar el contenedor con el id deseado
  
      if (metadataContainer) {  
        const addButton = metadataContainer.querySelector('.ds-form-add-more.btn.btn-link'); // Encuentra el botón "Añadir más" dentro del contenedor del metadato
  
        if (addButton) {
          (addButton as any).click(); // Simula un clic en el botón para agregar el nuevo campo
        } else {
          console.error(`Botón "Añadir más" no encontrado en el contenedor con id ${metadataContainer.id}.`);
        }
      } else {
        console.error('Contenedor no encontrado.');
      }
    } else {
      console.error('Input seleccionado no encontrado.');
    }
  
    await new Promise(resolve => setTimeout(resolve, 50)); // Espera un tiempo para asegurarse de que el nuevo campo se haya creado
  }

  // Método para procesar la lista de palabras clave
  async processRepeatableMetadata(keywordArray: string[], idPart: string = this.extractIdPart(), selectedTextarea: string = this.selectedTextarea) {
    for (const keyword of keywordArray) {
      // Función para copiar el texto en el textarea o input seleccionado
      const copyTextToElement = (element: HTMLTextAreaElement | HTMLInputElement, text: string) => {
        this.setMetadataValue(element, text, false);
      };

      const elementsWithSameId = Array.from(document.querySelectorAll(`[id*="${idPart}"]`))
          .filter(element => window.getComputedStyle(element).visibility === 'visible') // Filtrar elementos visibles

      let index = 0; // Definir la variable index
      let element = elementsWithSameId[index] as HTMLTextAreaElement | HTMLInputElement;

      // Si el elemento ya tiene un valor, busca el siguiente elemento vacío
      while (element && element.value) {
        element = elementsWithSameId[++index] as HTMLTextAreaElement | HTMLInputElement;
      }

      // Si no hay más elementos, crea uno nuevo
      if (!element) {
        await this.addMetadataField(selectedTextarea);
        const newElementsWithSameId = Array.from(document.querySelectorAll(`[id*="${idPart}"]`))
          .filter(element => window.getComputedStyle(element).visibility === 'visible') // Filtrar elementos visibles
        element = newElementsWithSameId[newElementsWithSameId.length - 1] as HTMLTextAreaElement | HTMLInputElement;
        copyTextToElement(element, keyword);

        // VER DE UNIFICAR
        const parent = element.closest('.col');
        if (parent) {
          const factory = this.componentFactoryResolver.resolveComponentFactory(DynamicButtonDropdownComponent);
          const componentRef = this.viewContainerRef.createComponent(factory);
          componentRef.instance.filterApplied.subscribe((filter: string) => {
            this.applyFilterToSubmissionField = true;
            const newValue = this.applyFilter(filter, element.value);
            this.setMetadataValue(element, newValue, true);
          });
          parent.insertAdjacentElement('afterend', componentRef.location.nativeElement);
        }
        // FIN VER DE UNIFICAR

      } else {
        copyTextToElement(element, keyword); // Si el elemento está vacío, copia el texto en él
      }
    }
  }

  // Marca el campo como modificado y después de unos segundos elimina el estilo
  modifiedFieldStyle(element: HTMLTextAreaElement | HTMLInputElement) {
    element.style.border = '2px solid green';
    setTimeout(() => {
      element.style.border = ''; // Elimina el estilo después de unos segundos
    }, 5000); // 5000 milisegundos = 5 segundos
  } 

  // Limpia la selección de texto y oculta el menú
  clearSelection() {
    this.selectedText = '';
    this.isTextSelected = false;
    this.selectedTextarea = '';
    this.removeButtons(this.container);
  }

  splitDate(date: string) {
    let day = '';
    let month = '';
    let year = '';
  
    // Meses en español para convertirlos a números
    const monthNames: { [key: string]: string } = {
      enero: '1', febrero: '2', marzo: '3', abril: '4', mayo: '5', junio: '6', julio: '7', agosto: '8', septiembre: '9', octubre: '10', noviembre: '11', diciembre: '12'
    };
  
    // Expresiones regulares para los distintos formatos
    const formats: {
      regex: RegExp;
      handler: (m: RegExpMatchArray) => Partial<{ day: string; month: string; year: string }>;
    }[] = [
      { regex: /^(\d{4})$/, handler: (m) => ({ year: m[1] }) }, // AAAA
      { regex: /^(\d{1,2})\/(\d{4})$/, handler: (m) => ({ month: m[1], year: m[2] }) }, // MM/AAAA
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, handler: (m) => ({ day: m[1], month: m[2], year: m[3] }) }, // DD/MM/AAAA
      { regex: /^(\d{4})\/(\d{1,2})$/, handler: (m) => ({ year: m[1], month: m[2] }) }, // AAAA/MM
      { regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, handler: (m) => ({ year: m[1], month: m[2], day: m[3] }) }, // AAAA/MM/DD
      { regex: /^([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[1].toLowerCase()], year: m[2] }) }, // M de AAAA
      { regex: /^([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[1].toLowerCase()], year: m[2] }) }, // M AAAA
      { regex: /^([a-zA-Zñ]+)-([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // M-M AAAA
      { regex: /^(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D de M de AAAA
      { regex: /^(\d{1,2})\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D M de AAAA
      { regex: /^(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D de M AAAA
      { regex: /^(\d{1,2})\s+al\s+(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[3].toLowerCase()], year: m[4] }) }, // D1 al D2 de M de AAAA
      { regex: /^(\d{1,2})-(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[3].toLowerCase()], year: m[4] }) }, // D1-D2 de M de AAAA
    ];
  
    for (const format of formats) {
      const match = date.match(format.regex);
      if (match) {
        const result = format.handler(match);
        day = result.day || '';
        month = result.month || '';
        year = result.year || '';
        break;
      }
    }
  
    return { day, month, year };
  }

  splitVolumeIssueYear(data: string) {
    const issuePatterns = [
      {
        regex: /(?:\bN[º°.\s]*\s*(\d+)|\((?:N[º°.\s]*?)?\s*(\d+)\)|N\.(\d+)|(?:Número|número)\s*(\d+)|\((\d+)\))/i,
        fields: ['issue'],
      },
    ];

    const yearPatterns = [
      {
        regex: /(?:Año|año)?\s*(\d{4})/i,
        fields: ['year'],
      },
    ];

    const volumePatterns = [
      {
        regex: /(?:[Vv](?:ol(?:\.|umen)?)?\.?\s*(\d+)|\b\w+,\s*(\d+))/i,
        fields: ['volume'],
      },
    ];

    const extraPatterns = [
      {
        regex: /(\d+)\.(\d+)/,
        fields: ['issue', 'volume'],
      },
      {
        regex: /(\d+)\s?\((\d+)\)/,
        fields: ['volume', 'issue'],
      },
    ];

    let result: { year?: string; volume?: string; issue?: string } = {};

    for (const pattern of issuePatterns) {
      const match = data.match(pattern.regex);
      if (match) {
        pattern.fields.forEach((field) => {
          const capturedValue = match.slice(1).find((value) => value !== undefined);
          if (capturedValue && result[field] === undefined) {
            result[field] = parseInt(capturedValue, 10).toString();
          }
        });
        break;
      }
    }

    for (const pattern of yearPatterns) {
      const match = data.match(pattern.regex);
      if (match) {
        pattern.fields.forEach((field) => {
          const capturedValue = match.slice(1).find((value) => value !== undefined);
          if (capturedValue && result[field] === undefined) {
            result[field] = capturedValue;
          }
        });
        break;
      }
    }

    for (const pattern of volumePatterns) {
      const match = data.match(pattern.regex);
      if (match) {
        pattern.fields.forEach((field) => {
          const capturedValue = match.slice(1).find((value) => value !== undefined);
          if (capturedValue && result[field] === undefined) {
            result[field] = capturedValue;
          }
        });
        break;
      }
    }

    if (!result.volume || !result.issue) {
      for (const pattern of extraPatterns) {
        const match = data.match(pattern.regex);
        if (match) {
          pattern.fields.forEach((field, index) => {
            const capturedValue = match.slice(index + 1).find((value) => value !== undefined);
            if (capturedValue && result[field] === undefined) {
              result[field] = capturedValue;
            }
          });
          break;
        }
      }
    }
  
    return result;
  } 
  
  // Método para establecer el valor de un campo de metadato
  setMetadataValue(element: HTMLTextAreaElement | HTMLInputElement, value: string, replaceText: boolean = this.replaceText) {
    if (element && (value !== '')) {
      element.focus();
      
      this.modifiedFieldStyle(element); // Marca el campo como modificado

      if (!element.value || replaceText) {
        element.value = value;
      } else {
        element.value = element.value + '\n' + value;
      }
  
      // Crear y disparar un evento de entrada y de cambio
      const inputEvent = new Event('input', { bubbles: true });
      element.dispatchEvent(inputEvent);
      const changeEvent = new Event('change', { bubbles: true });
      element.dispatchEvent(changeEvent);
  
      this.changeDetectorRef.detectChanges(); // Forzar la detección de cambios en Angular
    } else {
      alert(`Elemento con ID ${element.id} no encontrado. O valor no válido.`);
    }
  }


  // Prueba botones desplegables transformer
  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  // Fin prueba botones desplegables transformer


  // Prueba split inputs y filters
  showDynamicInputs: boolean = false;

  createInputs(parts: string[]) {
    const container = document.getElementById('inputsContainer');
    container.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos inputs
  
    parts.forEach((part, index) => {
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
      removeButton.addEventListener('click', () => {
        container.removeChild(inputGroup);
        const inputs = document.querySelectorAll('.dynamic-input');
        if (inputs.length === 0) {
          removeAllButton.remove();
          this.showDynamicInputs = false; // Ocultar inputs dinámicos
          // No se borra el texto seleccionado para dejar que el usuario pueda modificar la lista y recuperar los inputs de otra manera
        }
      });
  
      inputGroup.appendChild(input);
      inputGroup.appendChild(removeButton);
      container.appendChild(inputGroup);
    });

    const removeAllButton = document.createElement('button');
    removeAllButton.innerText = 'Eliminar todos';
    removeAllButton.classList.add('dynamic-remove-all-button');
    removeAllButton.addEventListener('click', () => {
      const inputs = document.querySelectorAll('.dynamic-input-group');
      inputs.forEach((inputGroup) => {
        container.removeChild(inputGroup);
      });
      removeAllButton.remove();
      this.showDynamicInputs = false;
    });

    // container.appendChild(removeAllButton);
    container.insertAdjacentElement('afterend', removeAllButton);
  }

  // VER si llamarlo de algún lado, o eliminarlo si no se usa
  clearDynamicInputs() {
    this.showDynamicInputs = false; // Ocultar inputs dinámicos
    const container = document.getElementById('inputsContainer');
    container.innerHTML = ''; // Limpiar el contenedor de inputs dinámicos
  }  

  applyFilter(filter: string, text: string = this.selectedText) {
    if (this.showDynamicInputs) {
      const inputs = document.querySelectorAll('.dynamic-input');
      inputs.forEach((input) => {
        let e = input as HTMLTextAreaElement | HTMLInputElement;
        e.value = this.applyFilterToText(e.value, filter);
        if (e.value === '') {
          e.parentElement.remove(); // Eliminar el input si está vacío (iría para todos los remove)
        }
      });
    } else if (this.applyFilterToSubmissionField) {
      this.applyFilterToSubmissionField = false;
      return this.applyFilterToText(text, filter);
    } else {
      this.selectedText = this.applyFilterToText(text, filter);
    }
  }

  // AGREGAR implementaciones faltantes
  applyFilterToText(text: string, filter: string): string {
    switch (filter) {
      case 'camelCase':
        return filterTransformer.toCamelCase(text);
      case 'upperCase':
        return filterTransformer.toUpperCase(text);
      case 'lowerCase':
        return filterTransformer.toLowerCase(text);
      case 'splitByDelimiter':
        const parts = filterTransformer.splitByDelimiter(text);
        this.showDynamicInputs = true; // Mostrar inputs dinámicos
        this.changeDetectorRef.detectChanges(); // Forzar la detección de cambios
        this.createInputs(parts);
        return text; // El selectedText no se modifica
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
      default:
        return text;
    }
  }

  async retrieveInputs() {
    const inputs = document.querySelectorAll('.dynamic-input');
    const idPart = this.extractIdPart();
    const selectedTextarea = this.selectedTextarea;
    for (const [index, input] of Array.from(inputs).entries()) {
      let e = input as HTMLTextAreaElement | HTMLInputElement;
      await this.processRepeatableMetadata([e.value], idPart, selectedTextarea);
    }
    this.showDynamicInputs = false;
    this.selectedText = '';
    this.isTextSelected = false;
  }
  // Fin prueba split inputs y filters



  // Prueba botones filter inputs formulario submission
  applyFilterToSubmissionField: boolean = false;

  ngAfterViewInit() {
    this.addButtonsToInputs();
  }

  addButtonsToInputs() {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    const inputss = Array.from(document.querySelectorAll('input'));
    const elements = [...textareas, ...inputss];

    const excludedIds = new Set([
      // Se cargan a mano
      'selected-text',
      'dc_type',
      'sedici_subtype',
      'dc_language',
      'sedici_description_fulltext',
      'sedici_description_peerReview',

      // No usan el transformer para editarse
      'dc_date_issued_year',
      'dc_date_issued_month',
      'dc_date_issued_day',
      'dc_date_created_year',
      'dc_date_created_month',
      'dc_date_created_day',
      'sedici_date_exposure_year',
      'sedici_date_exposure_month',
      'sedici_date_exposure_day',
    ]);
    const uniqueIdParts = new Set();

    this.metadataOptions = elements
      .filter(element => element.id) // Filtrar elementos con id
      .filter(element => {
        // Excluir elementos específicos y aquellos que coinciden con el patrón (Bitstreams subidos, FileUploader y otros)
        return !excludedIds.has(element.id) && !element.id.match(/^primaryBitstream\d+$/) && !element.id.match(/^inputFileUploader-ds-drag-and-drop-uploader\d+$/) && !element.id.match(/^SL_locer\d+$/) && !element.id.match(/^SL_BBL_locer\d+$/);
      })
      .filter(element => {
        const match = element.id.match(/(dc|sedici|mods|thesis).*/); // Extraer la parte común del id
        const idPart = match ? match[0] : element.id;
        if (uniqueIdParts.has(idPart)) {
          return false; // Si el idPart ya está en el Set, filtrar el elemento (para que no haya repetidos)
        } else {
          uniqueIdParts.add(idPart); // Agregar el idPart al Set
          return true; // Mantener el elemento
        }
      })
      .map(element => {
        const name = element.placeholder || element.name || element.id;
        return { name, value: element.id };
      })
    
    const escapeSelector = (id) => {
      return id.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
    };
  
    const inputs = document.querySelectorAll(this.metadataOptions.map(option => `[id="${escapeSelector(option.value)}"]`).join(', '));
    console.log('metadataOptions', this.metadataOptions);
    console.log('inputs', inputs);
    inputs.forEach(input => {
      // VER DE UNIFICAR2
      if (!input.id) return;

      const parent = input.closest('.col');
      if (!parent) return;

      const element = input as HTMLTextAreaElement | HTMLInputElement;
      const factory = this.componentFactoryResolver.resolveComponentFactory(DynamicButtonDropdownComponent);
      const componentRef = this.viewContainerRef.createComponent(factory);
      componentRef.instance.filterApplied.subscribe((filter: string) => {
        this.applyFilterToSubmissionField = true;
        const newValue = this.applyFilter(filter, element.value);
        this.setMetadataValue(element, newValue, true);
      });
      parent.insertAdjacentElement('afterend', componentRef.location.nativeElement);
      // FIN VER DE UNIFICAR2
    });
  }
  // Fin prueba botones filter inputs formulario submission
}