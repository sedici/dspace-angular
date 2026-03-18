import { Component } from '@angular/core';

import { AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent as CustomFooterComponent } from '../../themes/custom/app/footer/footer.component';

/**
 * Hardcoded proxy for Custom Footer to avoid dynamic insertion flickers
 */
@Component({
  selector: 'ds-footer',
  styleUrls: ['../../themes/custom/app/footer/footer.component.scss'],
  templateUrl: '../../themes/custom/app/footer/footer.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    TranslateModule,
  ],
})
export class ThemedFooterComponent extends CustomFooterComponent {
}
