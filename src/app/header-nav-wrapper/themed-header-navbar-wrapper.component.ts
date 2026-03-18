import { Component } from '@angular/core';

import { AsyncPipe, NgClass } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ThemedHeaderComponent } from '../header/themed-header.component';
import { ThemedNavbarComponent } from '../navbar/themed-navbar.component';

import { HeaderNavbarWrapperComponent as CustomHeaderNavbarWrapperComponent } from '../../themes/custom/app/header-nav-wrapper/header-navbar-wrapper.component';

/**
 * Hardcoded proxy for Custom Header Navbar Wrapper
 */
@Component({
  selector: 'ds-header-navbar-wrapper',
  styleUrls: ['../../themes/custom/app/header-nav-wrapper/header-navbar-wrapper.component.scss'],
  templateUrl: '../../themes/custom/app/header-nav-wrapper/header-navbar-wrapper.component.html',
  standalone: true,
  imports: [NgClass, ThemedHeaderComponent, ThemedNavbarComponent, AsyncPipe, TranslateModule],
})
export class ThemedHeaderNavbarWrapperComponent extends CustomHeaderNavbarWrapperComponent {
}
