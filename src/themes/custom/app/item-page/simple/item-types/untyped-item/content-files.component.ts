import { Component, Input, Inject } from '@angular/core';
import { NgFor, NgIf, NgStyle, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { Item } from 'src/app/core/shared/item.model';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { FileSizePipe } from 'src/app/shared/utils/file-size-pipe';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { SediciFileDownloadLinkComponent } from './sedici-file-download-link.component';

import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SediciViewerComponent } from '../../field-components/viewer/sedici-viewer.component';

import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as JSZip from 'jszip';

@Component({
  selector: 'content-files',
  styleUrls: ['./content-files.component.scss'],
  templateUrl: './content-files.component.html',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgStyle,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgTemplateOutlet,
    FileSizePipe,
    SediciFileDownloadLinkComponent,
    NgxDocViewerModule,
    SediciViewerComponent,
  ],
})
export class ContentFilesComponent {
  @Input() object: Item;

  primaryBitsreamId: string;
  previewUrl: string;

  isLoading = true;

  onDocLoaded() {
    this.isLoading = false;
  }

  openModal(content: any) {
    const modalRef = this.modalService.open(SediciViewerComponent, { size: 'lg' });
    modalRef.componentInstance.content = content;
  }

  files: Bitstream[] = [];

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    public dsoNameService: DSONameService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    private modalService: NgbModal,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  selectedFile: Bitstream | null = null;

  selectFile(file: Bitstream) {
    this.selectedFile = file;
    const extension = this.getFileExtension(file.name);
    this.isLoading = true;
  
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        this.previewUrl = file._links.content.href;
        this.isLoading = false;
        break;
      case 'zip':
        this.previewUrl = file._links.content.href;
        this.loadZipFromUrl(this.previewUrl);
        this.isLoading = false;
        break;
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'csv':
        // Harcodeo una URL de vista previa para probar
        this.previewUrl = "http://sedici.unlp.edu.ar/bitstream/handle/10915/59633/Cap%C3%ADtulo_1_-_Las_inundaciones_en_la_Regi%C3%B3n_Capital_-_Cartograf%C3%ADa_tem%C3%A1tica_para_el_planeamiento.CISAUA%2000%20Original%20Informe%20Final%20-%20PIO-%2030-3-17%20C009.pdf-PDFA.pdf?sequence=3&isAllowed=y";
        break;
      default:
        this.previewUrl = file._links.content.href;
        break;
    }
  }

  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return (parts.length > 1 ? parts.pop() : '').toLowerCase();
  }

  stringToHexColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash += str.charCodeAt(i);
      hash += (hash << 10);
      hash ^= (hash >> 6);
    }
    hash += (hash << 3);
    hash ^= (hash >> 11);
    hash += (hash << 15);
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  getBadgeStyle(fileName: string): { [key: string]: string } {
    const extension = this.getFileExtension(fileName);
    const color = this.stringToHexColor(extension);
    return { 'background-color': color };
  }

  getFileDescription(file: Bitstream): string {
    return file.metadata['dc.description']?.[0]?.value || this.dsoNameService.getName(file) ;
  }

  ngOnInit(): void {
    this.getPrimaryBitstreamId();
    this.getAllPages();
  }

  zipContent: { name: string, type: 'file' | 'folder' }[] = []; // Lista para mostrar los archivos dentro del ZIP y su tipo
  zipContentTree;

  async loadZipFromUrl(url: string) {
    try {
      // Descargar el archivo ZIP como Blob
      const zipBlob = await this.http.get(url, { responseType: 'blob' }).toPromise();

      // Cargar el archivo ZIP con JSZip
      const loadedZip = await JSZip.loadAsync(zipBlob);

       // Obtener y listar los nombres de los archivos en el ZIP
       this.zipContent = Object.keys(loadedZip.files).map(fileName => {
        const file = loadedZip.files[fileName];
        return {
          name: fileName,
          type: fileName.endsWith('/') ? 'folder' : 'file', // Determina si es un archivo o una carpeta
        };
      });

      const files = Object.keys(loadedZip.files);
      this.zipContentTree = this.buildTree(files);

      // Forzar la actualización de la vista
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al cargar el archivo ZIP:', error);
    }
  }

  // Convierte una lista de rutas en un árbol jerárquico
  buildTree(filePaths: string[]): any {
    const tree: any = {};

    filePaths.forEach((filePath) => {
      const parts = filePath.split('/').filter((part) => part.trim() !== '');
      let currentLevel = tree;

      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = index === parts.length - 1 ? null : {};
        }
        currentLevel = currentLevel[part];
      });
    });

    return tree;
  }

  // Devuelve las claves de un objeto
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Determina si un nodo es una carpeta
  isFolder(node: any): boolean {
    return node !== null && typeof node === 'object';
  }

  private getPrimaryBitstreamId() {
    this.bitstreamDataService.findPrimaryBitstreamByItemAndName(this.object, 'ORIGINAL', true, true).subscribe((primaryBitstream: Bitstream | null) => {
      if (!primaryBitstream) {
        return;
      }
      this.primaryBitsreamId = primaryBitstream?.id;
    });
  }

  getAllPages(): void {
    this.bitstreamDataService.findAllByItemAndBundleName(this.object, 'ORIGINAL', { currentPage: 0, elementsPerPage: 1000 }).subscribe((response: any) => {
      if (response && response.payload && response.payload.page.length > 0) {
        this.files = response.payload.page;
      }
    });
  }
}