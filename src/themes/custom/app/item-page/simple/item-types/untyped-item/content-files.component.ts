import { Component, Input, Inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Item } from 'src/app/core/shared/item.model';
import { BitstreamDataService } from 'src/app/core/data/bitstream-data.service';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { FileSizePipe } from 'src/app/shared/utils/file-size-pipe';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { SediciFileDownloadLinkComponent } from './sedici-file-download-link.component';

@Component({
  selector: 'content-files',
  styleUrls: ['./content-files.component.scss'],
  templateUrl: './content-files.component.html',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FileSizePipe,
    SediciFileDownloadLinkComponent,
  ],
})
export class ContentFilesComponent {
  @Input() object: Item;

  primaryBitsreamId: string;

  files: Bitstream[] = [];

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    public dsoNameService: DSONameService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
  ) {}

  selectedFile: Bitstream | null = null;

  selectFile(file: Bitstream) {
    this.selectedFile = file;
  }

  getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop() : '';
  }

  isImage(file: Bitstream): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = this.getFileExtension(file.name).toLowerCase();
    return imageExtensions.includes(extension);
  }

  getFileDescription(file: Bitstream): string {
    return file.metadata['dc.description']?.[0]?.value || this.dsoNameService.getName(file) ;
  }

  ngOnInit(): void {
    this.getPrimaryBitstreamId();
    this.getAllPages();
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