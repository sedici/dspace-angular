import { Component, Input, ViewChild, ChangeDetectorRef, NgZone, ComponentRef } from '@angular/core';
import { NgIf, NgFor, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfJsViewerModule } from "ng2-pdfjs-viewer";

import { filterTransformer } from '../../../../zfilterTransformer/filterTransformer.js';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { AfterViewInit } from '@angular/core';

import { ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { DynamicButtonDropdownComponent } from './dynamic-button-dropdown.component';
import { ShortcutsButtonsComponent } from './shortcuts-buttons.component';

import { SectionFormOperationsService } from '../sections/form/section-form-operations.service';
import { JsonPatchOperationPathCombiner } from '../../core/json-patch/builder/json-patch-operation-path-combiner'

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
  iframe;
  container;
  pdfIsLoading = true;
  private buttonComponents: ComponentRef<ShortcutsButtonsComponent>[] = [];

	constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private ngZone: NgZone,
    private formOperationsService: SectionFormOperationsService
  ) { }

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
    'dc_title_alternative',
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
      this.removeButtons(); // Borro los botones de acceso rápido
    }
		this.changeDetectorRef.detectChanges();
  }

  createButtons(rect: DOMRect): void {
    this.ngZone.run(() => { // Forzamos que Angular detecte cambios dentro de su zona
      this.removeButtons(); // Eliminar botones existentes para evitar duplicados

      const factory = this.componentFactoryResolver.resolveComponentFactory(ShortcutsButtonsComponent);
      const componentRef = this.viewContainerRef.createComponent(factory);
      
      componentRef.instance.rect = rect;
      componentRef.instance.buttonClicked.subscribe((event: { idElement: string, multiple: boolean }) => {
        this.handleButtonClicked(event.idElement, event.multiple);
      });
  
      this.buttonComponents.push(componentRef);
      this.changeDetectorRef.detectChanges(); // Ahora sí debería forzar el render correctamente
    });
  }

  handleButtonClicked(idElement: string, multiple: boolean) {
    this.selectedTextarea = idElement;
    const element = document.getElementById(this.selectedTextarea) as HTMLTextAreaElement | HTMLInputElement;
    if (multiple) {
      if (this.selectedTextarea === 'sedici_creator_person') {
        const authors = filterTransformer.transformPersons(this.selectedText);
        this.processRepeatableMetadata(authors);
      } else {
        const keywords = filterTransformer.transformKeywords(this.selectedText);
        this.processRepeatableMetadata(keywords);
      }
    } else {
      if (this.selectedTextarea === 'sedici_creator_person') {
        const author = filterTransformer.transformPerson(this.selectedText);
        this.processRepeatableMetadata([author]);
      } else if (this.selectedTextarea === 'dc_subject') {
        const keyword = filterTransformer.transformKeyword(this.selectedText);
        this.processRepeatableMetadata([keyword]);
      } else {
        this.setMetadataValue(element, this.selectedText, true);
      }
    }
    this.removeButtons();
  }

  removeButtons(): void {
    this.buttonComponents.forEach(componentRef => componentRef.destroy()); // Eliminamos solo los botones
    this.buttonComponents = []; // Limpiamos el array de referencias
  }
  
  copyToTextarea() {
    if (this.selectedTextarea) {
      const idPart = this.extractIdPart();
      let elements = document.querySelectorAll(`[id*="${this.selectedTextarea}"]`);
      let element = Array.from(elements).find(el => 
        window.getComputedStyle(el).visibility === 'visible' &&
        el.getAttribute('id').startsWith('label') === false
      ) as HTMLTextAreaElement | HTMLInputElement;
      
      if (this.showDynamicInputs) {
        this.retrieveInputs();
      } else if (idPart.includes('date')) {
        const date = this.splitDate(this.selectedText);
        const metadataYear = document.getElementById(this.selectedTextarea) as HTMLTextAreaElement | HTMLInputElement;
        const metadataMonth = document.getElementById(this.selectedTextarea.replace(/_year$/, '_month')) as HTMLTextAreaElement | HTMLInputElement;
        const metadataDay = document.getElementById(this.selectedTextarea.replace(/_year$/, '_day')) as HTMLTextAreaElement | HTMLInputElement;
        if (date.year != '') {
          this.setMetadataValue(metadataYear, date.year, true);
          if (date.month != '') {
            this.setMetadataValue(metadataMonth, date.month, true);
            if (date.day != '') {
              this.setMetadataValue(metadataDay, date.day, true);
            }
          }
        }
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
        } else if (journalVolumeAndIssue.tomo) {
          if(journalVolumeAndIssue.issue) {
            this.setMetadataValue(element, `tomo ${journalVolumeAndIssue.tomo}, no. ${journalVolumeAndIssue.issue}`, true);
          }
          else {
            this.setMetadataValue(element, `tomo ${journalVolumeAndIssue.tomo}`, true);
          }
        } else if (journalVolumeAndIssue.issue) {
          this.setMetadataValue(element, `no. ${journalVolumeAndIssue.issue}`, this.replaceText);
        } else {
          alert('No se encontraron año, volumen, tomo o número');
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
        .filter(element => {
          const id = element.getAttribute('id');
          return id === idPart || id.endsWith(idPart);
        })
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
          .filter(element => {
            const id = element.getAttribute('id');
            return id === idPart || id.endsWith(idPart);
          })
          .filter(element => window.getComputedStyle(element).visibility === 'visible') // Filtrar elementos visibles
        element = newElementsWithSameId[newElementsWithSameId.length - 1] as HTMLTextAreaElement | HTMLInputElement;
        copyTextToElement(element, keyword);
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
    this.removeButtons();
  }

  splitDate(date: string) {
    let day = '';
    let month = '';
    let year = '';
  
    // Meses en español para convertirlos a números
    const monthNames: { [key: string]: string } = {
      enero: '1', febrero: '2', marzo: '3', abril: '4', mayo: '5', junio: '6', julio: '7', agosto: '8', septiembre: '9', octubre: '10', noviembre: '11', diciembre: '12',
      january: '1', february: '2', march: '3', april: '4', may: '5', june: '6', july: '7', august: '8', september: '9', october: '10', november: '11', december: '12'
    };
  
    // FALTAN FORMATOS FECHAS EN INGLÉS (ej: April 7, 2017)
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
      { regex: /^(\d{4})\s+([a-zA-Zñ]+)$/, handler: (m) => ({ month: monthNames[m[2].toLowerCase()], year: m[1] }) }, // AAAA M
      { regex: /^([a-zA-Zñ]+)-([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // M-M AAAA
      { regex: /^(\d{1,2})\s+de\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D de M de AAAA
      { regex: /^(\d{1,2})\s+([a-zA-Zñ]+)\s+de\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D M de AAAA
      { regex: /^(\d{1,2})\s+([a-zA-Zñ]+)\s+(\d{4})$/, handler: (m) => ({ day: m[1], month: monthNames[m[2].toLowerCase()], year: m[3] }) }, // D M AAAA
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
    function romanToInt(roman: string): number {
      const romanNumeralMap: { [key: string]: number } = {
        I: 1,
        IV: 4,
        V: 5,
        IX: 9,
        X: 10,
        XL: 40,
        L: 50,
        XC: 90,
        C: 100,
        CD: 400,
        D: 500,
        CM: 900,
        M: 1000,
      };
    
      let i = 0;
      let num = 0;
    
      while (i < roman.length) {
        if (i + 1 < roman.length && romanNumeralMap[roman.substring(i, i + 2)]) {
          num += romanNumeralMap[roman.substring(i, i + 2)];
          i += 2;
        } else {
          num += romanNumeralMap[roman.charAt(i)];
          i += 1;
        }
      }
    
      return num;
    }
    
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
      {
        regex: /\b[IVXLCDM]+\b/g,  // Números romanos
        fields: ['tomo'],
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

    let result: { year?: string; volume?: string; tomo?: string; issue?: string } = {};

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
          let capturedValue = '';
          if (field === 'tomo') {
            capturedValue = romanToInt(match[0].toUpperCase()).toString();
          } else {
            capturedValue = match.slice(1).find((value) => value !== undefined);
          }
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
      case 'capitalize':
        return filterTransformer.toCapitalize(text);
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
      case 'reorderPerson':
        const result = filterTransformer.reorderPerson(text);
        if (!result) {
          alert('El filtro solo se puede aplicar cuando se tiene UN nombre y UN apellido.');
          return text;
        }
        return result;
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

    // Extiende el método original para interceptar los cambios
    const originalDispatch = this.formOperationsService.dispatchOperationsFromChangeEvent;
    this.formOperationsService.dispatchOperationsFromChangeEvent = 
      (pathCombiner: JsonPatchOperationPathCombiner, event: any, previousValue: any, hasStoredValue: boolean) => {
        // Intercepta el cambio antes de procesarlo
        if (event?.model?.id === 'dc_type' || event?.model?.id === 'sedici_subtype') {
          setTimeout(() => {
            this.addButtonsToInputs();
          }, 500);
        }
        // Llama al método original
        return originalDispatch.call(this.formOperationsService, pathCombiner, event, previousValue, hasStoredValue);
    };
  }

  private elementsAmount: number = 0;
  ngAfterViewChecked() {
    if (!this.tieneBotonesDinamicos()) {
      this.addButtonsToInputs();
    }

    const textareas = Array.from(document.querySelectorAll('textarea'));
    const inputss = Array.from(document.querySelectorAll('input'));
    const elements = [...textareas, ...inputss];
    if (this.elementsAmount !== elements.length) {
      this.elementsAmount = elements.length;
      this.addButtonsToInputs();
    }
  }

  private previousButtonCount = new Map<string, number>();
  // BUSCAR OTRO MÉTODO DE CHEQUEO DE FALTA DE BOTONES (interceptar momento del guardado automático)
  tieneBotonesDinamicos(): boolean {
    const secciones = ['traditionalpageone', 'traditionalpagetwo', 'traditionalpageone2', 'traditionalpagetwo2'];
    let cambiosDetectados = false;
    let tieneBotones = true;

    for (const seccion of secciones) {
      const sectionElement = document.querySelector(`[id="${seccion}-header"]`);
      const parent = sectionElement?.closest('.card');
      const buttons = parent?.querySelectorAll('app-dynamic-button-dropdown');
      const currentCount = buttons?.length || 0;
      
      if (!this.previousButtonCount.has(seccion)) {
        this.previousButtonCount.set(seccion, currentCount);
      }
      
      if (currentCount !== this.previousButtonCount.get(seccion)) {
        this.previousButtonCount.set(seccion, currentCount);
        cambiosDetectados = true;
      }
  
      if (cambiosDetectados && currentCount === 0) {
        tieneBotones = false;
        break; // Salir del bucle si se detecta un cambio y no hay botones
      }
    }
    
    return tieneBotones;
  }


  addButtonsToInputs() {
    this.removeFiltersButtons();

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
    const uniqueId = new Set();

    this.metadataOptions = elements
      .filter(element => window.getComputedStyle(element).visibility === 'visible') // Filtrar elementos visibles
      .filter(element => element.id) // Filtrar elementos con id
      .filter(element => {
        // Excluir elementos específicos y aquellos que coinciden con el patrón (Bitstreams subidos, FileUploader y otros)
        return !excludedIds.has(element.id) && !element.id.match(/^primaryBitstream\d+$/) && !element.id.match(/^inputFileUploader-ds-drag-and-drop-uploader\d+$/) && !element.id.match(/^SL_locer\d+$/) && !element.id.match(/^SL_BBL_locer\d+$/);
      })
      .filter(element => {
        if (uniqueId.has(element.id)) {
          return false; // Si el id ya está en el Set, filtrar el elemento (para que no haya repetidos)
        } else {
          uniqueId.add(element.id); // Agregar el id al Set
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
  
    inputs.forEach(input => {
      let container;

      if (!input.id) return;
  
      const parent = input.closest('.col') || input.closest('ds-dynamic-form-control-container');
      if (!parent) return;

      if (parent.classList.contains('col-sm-12')) {
        container = document.createElement('div');
        container.classList.add('d-flex', 'align-items-center', 'w-100');
        container.style.gap = '8px';
        
        input.classList.add('flex-grow-1');
        input.parentNode.insertBefore(container, input);
        container.appendChild(input);
      }

      const factory = this.componentFactoryResolver.resolveComponentFactory(DynamicButtonDropdownComponent);
      const componentRef = this.viewContainerRef.createComponent(factory);
      
      componentRef.instance.filterApplied.subscribe((filter: string) => {
        this.applyFilterToSubmissionField = true;
        const newValue = this.applyFilter(filter, (input as HTMLInputElement).value);
        this.setMetadataValue(input as HTMLInputElement, newValue, true);
      });
      
      if (parent.classList.contains('col-sm-12')) {
        container.appendChild(componentRef.location.nativeElement);
      } else {
        parent.insertAdjacentElement('afterend', componentRef.location.nativeElement);
      }
    });
  }

  removeFiltersButtons(): void {
    const buttons = document.querySelectorAll('app-dynamic-button-dropdown');
    buttons.forEach((button) => button.remove());
  }
  
  // Fin prueba botones filter inputs formulario submission
}