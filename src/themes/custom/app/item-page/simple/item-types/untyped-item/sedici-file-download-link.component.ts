import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FileDownloadLinkComponent } from 'src/app/shared/file-download-link/file-download-link.component';

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
  ],
})
export class SediciFileDownloadLinkComponent extends FileDownloadLinkComponent implements OnInit {
  
}