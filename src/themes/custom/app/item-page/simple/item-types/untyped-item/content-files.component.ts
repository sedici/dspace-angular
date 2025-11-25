import { Component, Input, Inject, ViewChild, ElementRef } from '@angular/core';
import { NgStyle, NgClass, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Item } from 'src/app/core/shared/item.model';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { FileSizePipe } from 'src/app/shared/utils/file-size-pipe';
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

import { PdfJsViewerModule } from "ng2-pdfjs-viewer";
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { SediciShareButtonsComponent } from '../../field-components/share-buttons/sedici-share-buttons.component';
@Component({
  selector: 'content-files',
  styleUrls: ['./content-files.component.scss'],
  templateUrl: './content-files.component.html',
  standalone: true,
  imports: [
    NgStyle,
    NgClass,
    NgTemplateOutlet,
    AsyncPipe,
    TranslateModule,
    FileSizePipe,
    SediciFileDownloadLinkComponent,
    SediciViewerComponent,
    PdfJsViewerModule
],
})
export class ContentFilesComponent {
  @Input() object: Item;
  @ViewChild('pdfViewerOnDemand') pdfViewerOnDemand;

  primaryBitsreamId: string;
  previewUrl: string;

  isLoading = true;

  currentYoutubeUrl: SafeResourceUrl | null = null;

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
  files: Bitstream[] = [];

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

  selectedFile: Bitstream | null = null;
  embargoedFile: boolean = false;
  isAssetAvailable: boolean = true;

  selectFile(file: Bitstream) {
    const fileAny = file as any;
    this.selectedFile = file;
    this.isLoading = true;
    this.embargoedFile = false;
    this.isAssetAvailable = true;
    const authToken = this.authService.getToken();
    
    if (fileAny.isYoutube) {
      this.currentYoutubeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileAny.embedUrl);
      this.previewUrl = null; 
      this.isLoading = false;
      this.cdr.detectChanges();
      return; 
    }

    const extension = this.getFileExtension(file.name);
    this.currentYoutubeUrl = null;
    this.cdr.detectChanges();
  
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        this.previewUrl = file._links.content.href;
        this.isLoading = false;
        break;
      case 'mp4':
      case 'mpeg':
      case 'mov':
      case 'webm':
      case 'ogg':
        this.previewUrl = file._links.content.href;
        this.isLoading = false;
        break;
      case 'zip':
        this.previewUrl = file._links.content.href;
        this.loadZipFromUrl(this.previewUrl);
        this.isLoading = false;
        break;
      case 'pdf':
        this.previewUrl = file._links.content.href;

        const waitForDownloadable = (file: Bitstream) => {
          if (this.isDownloadable(file) !== undefined) {
            if(this.isDownloadable(this.selectedFile)) {
              // Usar HttpClient para obtener el archivo con autenticación
              this.http.get(this.previewUrl, {
                headers: new HttpHeaders({
                  'Authorization': `Bearer ${authToken}`
                }),
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
        waitForDownloadable(this.selectedFile);
        break;
      default:
        if(file._links && file._links.content) {
          this.previewUrl = file._links.content.href;
        }
        this.isLoading = false;
        break;
    }
  }

  isPreviewAvailable(fileName: string): boolean {
    const extension = this.getFileExtension(fileName);
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'zip', 'pdf', 'youtube', 'mp4', 'mpeg', 'mov', 'webm', 'ogg'].includes(extension);
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
    const videoExtensions = ['mp4', 'mpeg', 'mov', 'webm', 'ogg'];
    return videoExtensions.includes(extension);
  }

  getIconPath(fileName: string): string {
    const extension = this.getFileExtension(fileName);
    if (this.isImageFile(extension)) {
      return `assets/custom/images/icon_imagen.png`;
    }
    if (this.isVideoFile(extension)) {
      return `assets/custom/images/icon_video.png`;
    }
    return `assets/custom/images/icon_${extension}.png`;
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

        this.addYoutubeVideosToFiles();
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
      this.addYoutubeVideosToFiles();
      this.isLoadingFiles = false;
      this.notificationsService.error('Error', 'Error al cargar archivos.');
    });
  }

  addYoutubeVideosToFiles() {
    const uriMetadata = this.object.allMetadata('sedici.identifier.uri');
    
    uriMetadata.forEach((mdValue, index) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = mdValue.value.match(regExp);

      if (match && match[2].length === 11) {
        const videoId = match[2];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const fullYoutubeUrl = mdValue.value;
        
        const mockVideoBitstream: any = {
          id: `youtube-${videoId}-${index}`,
          name: `youtube_video_${videoId}.youtube`,
          type: 'bitstream',
          metadata: {
            'dc.description': [{ value: 'Cargando título del video...' }] // Título temporal mientras carga
          },
          _links: {
            content: { href: embedUrl }
          },
          isYoutube: true,
          embedUrl: embedUrl,
          canDownload: false
        };

        this.files.push(mockVideoBitstream);

        // Usamos noembed.com para evitar problemas de CORS y no necesitar API Key
        const oEmbedUrl = `https://noembed.com/embed?url=${encodeURIComponent(fullYoutubeUrl)}`;

        this.externalHttp.get(oEmbedUrl).subscribe({
          next: (data: any) => {
            if (data && data.title) {
              mockVideoBitstream.metadata['dc.description'][0].value = data.title;
              this.cdr.detectChanges();
            }
          },
          error: (err) => {
            console.warn('No se pudo obtener el título de YouTube, usando fallback', err);
            mockVideoBitstream.metadata['dc.description'][0].value = `Video Youtube (${videoId})`;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  checkAndSaveDownloadStatus(): void {
    this.files.forEach(file => {
      this.authorizationService.isAuthorized(
        FeatureID.CanDownload,
        isNotEmpty(file) ? file.self : undefined)
        .subscribe(canDownload => {
          // Extiende el objeto file con una nueva propiedad canDownload
          (file as any).canDownload = canDownload;
          this.cdr.detectChanges();
        });
    });
  }

  isDownloadable(file: any): boolean {
    return (file as any).canDownload;
  }

  hasPreviewAndDownloadableFiles(): boolean {
    return this.files.some(file => this.isPreviewAvailable(file.name) && (file as any).canDownload);
  }

  handleClick(file: Bitstream, contentTemplate: any, headerTemplate: any) {
    this.selectFile(file);
    setTimeout(() => {
      if (this.isMobile) {
        this.openModal(contentTemplate, headerTemplate);
      }
    }, 100);
  }
}