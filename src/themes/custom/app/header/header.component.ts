import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';

import { ContextHelpToggleComponent } from '../../../../app/header/context-help-toggle/context-help-toggle.component';
import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';
import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

/**
 * Represents the header with the logo and simple navigation
 */
@Component({
  selector: 'ds-themed-header',
  styleUrls: ['header.component.scss'],
  // styleUrls: ['../../../../app/header/header.component.scss'],
  templateUrl: 'header.component.html',
  // templateUrl: '../../../../app/header/header.component.html',
  standalone: true,
  imports: [RouterLink, ThemedLangSwitchComponent, NgbDropdownModule, ThemedSearchNavbarComponent, ThemedNavbarComponent, ContextHelpToggleComponent, ThemedAuthNavMenuComponent, ImpersonateNavbarComponent, TranslateModule, AsyncPipe, NgIf, NgbModule],
})
export class HeaderComponent extends BaseComponent {
}
