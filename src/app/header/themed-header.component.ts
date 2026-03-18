import { Component } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ThemedSearchNavbarComponent } from '../search-navbar/themed-search-navbar.component';
import { ThemedNavbarComponent } from '../navbar/themed-navbar.component';
import { SearchFormComponent } from '../../themes/custom/app/shared/search-form/search-form.component';

import { HeaderComponent as CustomHeaderComponent } from '../../themes/custom/app/header/header.component';

/**
 * Hardcoded proxy for Custom Header to avoid dynamic insertion flickers
 */
@Component({
  selector: 'ds-header',
  styleUrls: ['../../themes/custom/app/header/header.component.scss'],
  templateUrl: '../../themes/custom/app/header/header.component.html',
  standalone: true,
  imports: [RouterLink, SearchFormComponent, NgbDropdownModule, ThemedSearchNavbarComponent, ThemedNavbarComponent, TranslateModule, AsyncPipe, NgClass, NgbModule],
})
export class ThemedHeaderComponent extends CustomHeaderComponent {
}
