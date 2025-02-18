import {
  AsyncPipe,
  NgClass,
  NgIf,
} from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
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
  @Input() isSticky: boolean = false;

  adaptFileSize (size: string): string {
    if (size.includes("KB")) {
      const kbValue = parseFloat(size.replace("KB", "").trim()); // Extraer el valor numérico en KB
      const mbValue = kbValue / 1024; // Convertir a MB y formatear a 1 decimal
      const roundedMbValue = Math.round(mbValue * 10) / 10; // Redondear a 1 decimal
      const formattedMbValue = roundedMbValue % 1 === 0 ? roundedMbValue.toFixed(0) : roundedMbValue.toFixed(1); // Verificar si es un valor entero
      return `${formattedMbValue} MB`;
    } else if (size.includes("MB")) {
      const mbValue = parseFloat(size.replace("MB", "").trim()); // Extraer el valor numérico en MB
      if (mbValue >= 1000) { // Si el valor en MB es mayor o igual a 1000, convertir a GB
        // const gbValue = mbValue / 1000;
        // const roundedGbValue = Math.round(gbValue * 10) / 10;
        // const formattedGbValue = roundedGbValue % 1 === 0 ? roundedGbValue.toFixed(0) : roundedGbValue.toFixed(1);
        // return `${formattedGbValue} GB`;
        return "1 GB"; // Todavía en SEDICI no hay archivos que superen 1 GB, pero queda plateado a futuro el método
      }
    }
    return size;
  }
}