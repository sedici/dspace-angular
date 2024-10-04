import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FileSizePipe } from 'src/app/shared/utils/file-size-pipe';
import { FileDownloadLinkComponent } from 'src/app/shared/file-download-link/file-download-link.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ds-sedici-file-download-link',
  templateUrl: './sedici-file-download-link.component.html',
  styleUrls: ['./sedici-file-download-link.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    NgIf,
    RouterLink,
    TranslateModule,
    FileSizePipe,
    NgbTooltipModule,
  ],
})
export class SediciFileDownloadLinkComponent extends FileDownloadLinkComponent implements OnInit {
  
}