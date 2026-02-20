import { ChangeDetectorRef, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ComcolPageHandleComponent as BaseComponent } from '../../../../../../app/shared/comcol/comcol-page-handle/comcol-page-handle.component';

@Component({
  selector: 'ds-themed-comcol-page-handle',
  templateUrl: './comcol-page-handle.component.html',
  // templateUrl: '../../../../../../app/shared/comcol/comcol-page-handle/comcol-page-handle.component.html',
  styleUrls: ['./comcol-page-handle.component.scss'],
  // styleUrls: ['../../../../../../app/shared/comcol/comcol-page-handle/comcol-page-handle.component.scss'],
  imports: [
    TranslateModule,
  ],
})
export class ComcolPageHandleComponent extends BaseComponent {

  copied = false;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  /**
   * Extrae solo el identificador del handle desde la URL completa.
   * Ejemplo: "https://hdl.handle.net/3.3347/10911235/6783" → "3.3347/10911235/6783"
   */
  getHandleId(): string {
    const match = this.getHandle().match(/handle\/(.+)$|hdl\.handle\.net\/(.+)$|\/handle\/(.+)$/);
    if (match) {
      return match[1] ?? match[2] ?? match[3];
    }
    return this.getHandle();
  }

  copyHandle(): void {
    navigator.clipboard.writeText(this.getHandle()).then(() => {
      this.copied = true;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copied = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }, 2000);
    });
  }
}
