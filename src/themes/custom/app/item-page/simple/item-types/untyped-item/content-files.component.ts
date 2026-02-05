import { Component, Input, Inject, ViewChild, ElementRef } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Item } from 'src/app/core/shared/item.model';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';
import { Bitstream } from 'src/app/core/shared/bitstream.model';

import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { SediciFileDownloadLinkComponent } from './sedici-file-download-link.component';
import { isNotEmpty } from 'src/app/shared/empty.util';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SediciViewerComponent } from '../../field-components/viewer/sedici-viewer.component';


import { ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as JSZip from 'jszip';

import { HostWindowService, WidthCategory } from 'src/app/shared/host-window.service';
import { Observable } from 'rxjs';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';

import { PdfJsViewerModule } from 'ng2-pdfjs-viewer';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { SediciShareButtonsComponent } from '../../field-components/share-buttons/sedici-share-buttons.component';

type ExternalServiceType = 'youtube' | 'sketchfab' | 'generic';

interface ExternalBitstreamMock {
  id: string;
  name: string;
  type: 'bitstream';
  metadata: any;
  _links: any;
  // Propiedades exclusivas de recursos externos
  isExternal: boolean;
  externalService: ExternalServiceType;
  embedUrl: string; // URL cruda sin sanitizar
  canDownload: boolean; // Siempre false
}

const EXTERNAL_CONFIG = {
  youtube: {
    regex: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
    embedBase: (id: string) => `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&iv_load_policy=3`,
    oEmbed: (url: string) => `https://noembed.com/embed?url=${encodeURIComponent(url)}`
  },
  sketchfab: {
    regex: /sketchfab\.com\/(?:models|3d-models)\/(?:[a-zA-Z0-9-]+\-)?([a-f0-9]{32})/,
    embedBase: (id: string) => `https://sketchfab.com/models/${id}/embed`,
    oEmbed: null // Sketchfab suele requerir API real, usamos fallback manual si es null
  },
  generic: {
    regex: null, 
    embedBase: (url: string) => url, 
    oEmbed: null
  }
};

@Component({
  selector: 'content-files',
  styleUrls: ['./content-files.component.scss'],
  templateUrl: './content-files.component.html',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    TranslateModule,
    SediciFileDownloadLinkComponent,
    PdfJsViewerModule
  ],
})
export class ContentFilesComponent {
  @Input() object: Item;
  @ViewChild('pdfViewerOnDemand') pdfViewerOnDemand;
  osdViewer: any;

  primaryBitsreamId: string;
  previewUrl: string;

  isLoading = true;

  currentExternalUrl: SafeResourceUrl | null = null;
  currentExternalService: ExternalServiceType | null = null;

  private externalHttp: HttpClient;

  onDocLoaded() {
    this.isLoading = false;
  }

  openModal(content: any, headerTemplate: any) {
    const modalRef = this.modalService.open(SediciViewerComponent, { size: 'lg', windowClass: 'fullscreen-modal', centered: true });
    modalRef.componentInstance.content = content;
    modalRef.componentInstance.headerTemplate = headerTemplate;
    modalRef.componentInstance.embargoedFile = this.embargoedFile;
    modalRef.componentInstance.isAssetAvailable = this.isAssetAvailable;
    
    // Esperar a que el modal se muestre completamente
    modalRef.shown.subscribe(() => {
      if (this.selectedFile && this.isImageFile(this.getFileExtension(this.selectedFile.name))) {
        this.initOpenSeadragon();
      }
    });
  }

  openModalShareButtons() {
    const modalRef = this.modalService.open(SediciShareButtonsComponent, {
      centered: true, // Centra el modal
    });
    modalRef.componentInstance.link = this.object.firstMetadataValue('dc.identifier.uri');
    modalRef.componentInstance.title = this.object.firstMetadataValue('dc.title');
    modalRef.componentInstance.type = this.object.firstMetadataValue('sedici.subtype') || this.object.firstMetadataValue('dc.type');
  }

  isLoadingFiles: boolean = true;
  files: (Bitstream | ExternalBitstreamMock)[] = [];

  isMobile$: Observable<boolean>;
  isMobile = false;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    public dsoNameService: DSONameService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    private modalService: NgbModal,
    private http: HttpClient,
    private handler: HttpBackend,
    private cdr: ChangeDetectorRef,
    private windowService: HostWindowService,
    private notificationsService: NotificationsService,
    private authService: AuthService,
    private authorizationService: AuthorizationDataService,
    private sanitizer: DomSanitizer,
  ) {
    this.isMobile$ = this.windowService.isUpTo(WidthCategory.MD);
    this.externalHttp = new HttpClient(handler);
  }

  selectedFile: Bitstream | ExternalBitstreamMock | null = null;
  embargoedFile: boolean = false;
  isAssetAvailable: boolean = true;

  selectFile(file: Bitstream | ExternalBitstreamMock) {
    if (this.osdViewer) {
      this.osdViewer.destroy();
      this.osdViewer = null;
    }

    this.selectedFile = file;
    this.isLoading = true;
    this.embargoedFile = false;
    this.isAssetAvailable = true;
    const authToken = this.authService.getToken();
    this.currentExternalUrl = null;
    this.currentExternalService = null;
    this.previewUrl = null;
    
    if ('isExternal' in file && file.isExternal) {
      const extFile = file as ExternalBitstreamMock;
      this.currentExternalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(extFile.embedUrl);
      this.currentExternalService = extFile.externalService;
      this.isLoading = false;
      this.cdr.detectChanges();
      return; 
    }

    const bitstream = file as Bitstream;
    const extension = this.getFileExtension(file.name);
  
    switch (extension) {
      // IMAGENES
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        this.previewUrl = file._links.content.href;
        this.isLoading = false;
        if (!this.isMobile) {
          setTimeout(() => {
            this.initOpenSeadragon();
          }, 100);
        }
        break;
      // VIDEOS
      case 'mp4':
      case 'mov':
      case 'webm':
      case 'ogg':
        this.previewUrl = file._links.content.href;
        this.isLoading = false;
        break;
      // AUDIOS
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
      case 'ogx':
        this.previewUrl = file._links.content.href;
        this.isLoading = false;
        break;
      // ZIP
      case 'zip':
        this.previewUrl = file._links.content.href;
        this.loadZipFromUrl(this.previewUrl);
        this.isLoading = false;
        break;
      // PDF
      case 'pdf':
        this.previewUrl = file._links.content.href;

        const waitForDownloadable = (file: Bitstream) => {
          if (this.isDownloadable(file) !== undefined) {
            if(this.isDownloadable(this.selectedFile)) {
              let headers = new HttpHeaders();
              if (authToken) {
                headers = headers.set('Authorization', `Bearer ${authToken}`);
              }
              this.http.get(this.previewUrl, {
                headers: headers,
                responseType: 'blob'
              }).subscribe((data: Blob) => {
                // Crear una URL para el blob
                const objectUrl = URL.createObjectURL(data);
    
                // Verificar si el visor PDF está disponible
                const assignBlobUrl = () => {
                  if (this.pdfViewerOnDemand) {
                    // Asignar la URL del blob al visor PDF
                    this.pdfViewerOnDemand._src = objectUrl;
                    this.pdfViewerOnDemand.refresh();
                    this.isLoading = false;
                  } else {
                    console.error('El visor PDF no está disponible.');
                    setTimeout(assignBlobUrl, 100); // Intentar nuevamente después de 100ms
                  }
                };
                assignBlobUrl();
              }, error => {
                console.error('Error al cargar el archivo:', error);
                if (error.status === 401 || error.status === 403) {
                  this.embargoedFile = true;
                  this.cdr.detectChanges();
                }
                if (error.status === 500) {
                  this.isAssetAvailable = false;
                  this.cdr.detectChanges();
                }  
                this.isLoading = false;
              });
            } else {
              this.embargoedFile = true;
            }
            this.isLoading = false;
            this.cdr.detectChanges();
          } else {
            setTimeout(() => waitForDownloadable(file), 100);
          }
        }
        waitForDownloadable(bitstream);
        break;
      default:
        if(file._links && file._links.content) {
          this.previewUrl = file._links.content.href;
        }
        this.isLoading = false;
        break;
    }
    this.cdr.detectChanges();
  }

  initOpenSeadragon() {
    if (this.osdViewer) {
      this.osdViewer.destroy();
      this.osdViewer = null;
    }

    if (typeof window !== 'undefined' && document.getElementById('osd-viewer')) {
      
      import('openseadragon').then(osdModule => {
        const OpenSeadragon = osdModule.default;

        this.osdViewer = OpenSeadragon({
          id: 'osd-viewer',
          prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',

          tileSources: {
            type: 'image',
            url: this.previewUrl,
            buildPyramid: false
          } as any,

          showNavigationControl: true, // Esto muestra los botones
          // showNavigator: true,      // Esto muestra el mapa de la imagen (opcional)

          defaultZoomLevel: 0,
          minZoomLevel: 0.5,
          maxZoomLevel: 10,
          visibilityRatio: 1.0,
          constrainDuringPan: true,
          gestureSettingsMouse: {
            clickToZoom: false
          }
        });

        this.osdViewer.addHandler('open-failed', () => {
          this.notificationsService.error('Error', 'No se pudo cargar la imagen.');
        });

      }).catch(error => {
        console.error('Error cargando OpenSeadragon:', error);
      });
    }
  }

  isPreviewAvailable(fileName: string): boolean {
    const extension = this.getFileExtension(fileName);
    return ['zip', 'pdf'].includes(extension) 
      || this.isImageFile(extension)
      || this.isVideoFile(extension) 
      || this.isAudioFile(extension)
      || this.is3DModel(extension);
  }

  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return (parts.length > 1 ? parts.pop() : '').toLowerCase();
  }

  isImageFile(extension: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    return imageExtensions.includes(extension);
  }

  isVideoFile(extension: string): boolean {
    const videoExtensions = ['youtube', 'mp4', 'mov', 'webm', 'ogg'];
    return videoExtensions.includes(extension);
  }

  isAudioFile(extension: string): boolean {
    const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'ogx'];
    return audioExtensions.includes(extension);
  }

  is3DModel(extension: string): boolean {
    const modelExtensions = ['sketchfab', 'obj', 'glb'];
    return modelExtensions.includes(extension);
  }

  getIconPath(fileName: string): string {
    const extension = this.getFileExtension(fileName);
    if (this.isImageFile(extension)) {
      return `assets/custom/images/icon_imagen.png`;
    } else if (this.isVideoFile(extension)) {
      return `assets/custom/images/icon_video.svg`;
    } else if (this.isAudioFile(extension)) {
      return `assets/custom/images/icon_audio.png`;
    } else if (this.is3DModel(extension)) {
      return `assets/custom/images/icon_3dmodel.svg`;
    } else if (extension === 'pdf') {
      return `assets/custom/images/icon_pdf.png`;
    } else if (extension === 'zip') {
      return `assets/custom/images/icon_zip.png`;
    } else if (extension === 'generic') {
      return `assets/custom/images/icon_link.svg`;
    }
    return `assets/custom/images/icon_default.svg`;
  }

  getFileDescription(file: any): string {
    return file.metadata['dc.description']?.[0]?.value || this.dsoNameService.getName(file);
  }

  ngOnInit(): void {
    this.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
    });
    this.getPrimaryBitstreamId().then(() => {
      this.getAllPages();
    });
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

  private getPrimaryBitstreamId(): Promise<string | null> {
    return new Promise((resolve) => {
      this.bitstreamDataService.findPrimaryBitstreamByItemAndName(this.object, 'ORIGINAL', true, true).subscribe((primaryBitstream: Bitstream | null) => {
        if (primaryBitstream) {
          this.primaryBitsreamId = primaryBitstream.id;
          resolve(this.primaryBitsreamId);
        } else {
          resolve(null);
        }
      });
      resolve(null);
    });
  }

  getAllPages(): void {
    this.isLoadingFiles = true;
    this.bitstreamDataService.findAllByItemAndBundleName(this.object, 'ORIGINAL', { currentPage: 0, elementsPerPage: 1000 }).subscribe((response: any) => {
      if (response && response.hasSucceeded) {
        let bitstreams = [];
        if (response.payload && response.payload.page.length > 0) {
          bitstreams = response.payload.page;
        }
        this.files = bitstreams;

        this.processExternalResources();
        this.cdr.detectChanges();
        this.checkAndSaveDownloadStatus();
        
        if (!this.isMobile && this.files.length >= 1) {
          // Seleccionar el primary bitstream si está disponible y tiene un preview
          const primaryBitstream = this.files.find(file => file.id === this.primaryBitsreamId && this.isPreviewAvailable(file.name));
          if (primaryBitstream) {
            this.selectFile(primaryBitstream);
          } else {
            // Seleccionar el primer archivo con preview disponible
            const firstPreviewableFile = this.files.find(file => this.isPreviewAvailable(file.name));
            if (firstPreviewableFile) {
              this.selectFile(firstPreviewableFile);
            }
          }
        }
        this.isLoadingFiles = false;
        this.cdr.detectChanges();
      }
    },
    (err) => {
      // Manejo de error, pero aun así intentamos cargar videos si fallan los archivos
      this.files = []; 
      this.processExternalResources();
      this.isLoadingFiles = false;
      this.notificationsService.error('Error', 'Error al cargar archivos.');
    });
  }

  processExternalResources() {
    const uriMetadata = this.object.allMetadata('sedici.identifier.uri');
    
    uriMetadata.forEach((mdValue, index) => {
      const url = mdValue.value;
      
      const ytMatch = url.match(EXTERNAL_CONFIG.youtube.regex);
      if (ytMatch && ytMatch[2].length === 11) {
        this.addExternalFile('youtube', ytMatch[2], url, index);
        return;
      }

      const skMatch = url.match(EXTERNAL_CONFIG.sketchfab.regex);
      if (skMatch && skMatch[1]) {
        this.addExternalFile('sketchfab', skMatch[1], url, index);
        return;
      }

      this.addExternalFile('generic', null, url, index);
    });
  }

  addExternalFile(service: ExternalServiceType, id: string, originalUrl: string, index: number) {
    const config = EXTERNAL_CONFIG[service];
    const embedUrl = (service === 'generic') ? originalUrl : config.embedBase(id!);

    const mockFile: ExternalBitstreamMock = {
      id: `${service}-${index}`,
      name: `${service}_resource.${service}`,
      type: 'bitstream',
      metadata: { 
        'dc.description': [{ value: `Recurso externo` }], // Valor por defecto
        'sedici.identifier.uri': [{ value: originalUrl }] 
      },
      _links: { content: { href: embedUrl } },
      isExternal: true,
      externalService: service,
      embedUrl: embedUrl,
      canDownload: false
    };

    this.files.push(mockFile);

    if (service === 'generic') {
      try {
        const hostname = new URL(originalUrl).hostname.replace('www.', '');
        mockFile.metadata['dc.description'][0].value = `Enlace externo a ${hostname}`;
      } catch (e) {
        mockFile.metadata['dc.description'][0].value = `Enlace externo`;
      }
    } else if (config.oEmbed) {
      const oEmbedUrl = config.oEmbed(originalUrl);
      this.externalHttp.get(oEmbedUrl).subscribe({
        next: (data: any) => {
          if (data && data.title) {
            mockFile.metadata['dc.description'][0].value = data.title;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          mockFile.metadata['dc.description'][0].value = `${service.charAt(0).toUpperCase() + service.slice(1)} Video/Model`;
          this.cdr.detectChanges();
        }
      });
    } else {
      mockFile.metadata['dc.description'][0].value = `${service.charAt(0).toUpperCase() + service.slice(1)} Resource`;
    }
  }

  checkAndSaveDownloadStatus(): void {
    this.files.forEach(file => {
      if ('isExternal' in file) {
        (file as any).canDownload = false;
      } else {
        const bitstream = file as Bitstream;
        this.authorizationService.isAuthorized(FeatureID.CanDownload, isNotEmpty(bitstream) ? bitstream.self : undefined)
          .subscribe(canDownload => { (bitstream as any).canDownload = canDownload; this.cdr.detectChanges(); });
      }
    });
  }

  isDownloadable(file: Bitstream | ExternalBitstreamMock): boolean {
    return (file as any).canDownload;
  }

  hasPreviewAndDownloadableFiles(): boolean {
    return this.files.some(file => this.isPreviewAvailable(file.name) && (file as any).canDownload);
  }

  handleClick(file: Bitstream | ExternalBitstreamMock, contentTemplate: any, headerTemplate: any) {
    this.selectFile(file);
    setTimeout(() => {
      if (this.isMobile) {
        this.openModal(contentTemplate, headerTemplate);
      }
    }, 100);
  }
}