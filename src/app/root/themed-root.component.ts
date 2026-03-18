import { Component, Input } from '@angular/core';

import { slideSidebarPadding } from '../shared/animations/slide';
import { AsyncPipe, NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ThemedAdminSidebarComponent } from '../admin/admin-sidebar/themed-admin-sidebar.component';
import { ThemedBreadcrumbsComponent } from '../breadcrumbs/themed-breadcrumbs.component';
import { ThemedFooterComponent } from '../footer/themed-footer.component';
import { ThemedHeaderNavbarWrapperComponent } from '../header-nav-wrapper/themed-header-navbar-wrapper.component';
import { ThemedLoadingComponent } from '../shared/loading/themed-loading.component';
import { NotificationsBoardComponent } from '../shared/notifications/notifications-board/notifications-board.component';
import { SystemWideAlertBannerComponent } from '../system-wide-alert/alert-banner/system-wide-alert-banner.component';

import { SediciPostFooterComponent } from '../../themes/custom/app/sedici-post-footer/sedici-post-footer.component';
import { FooterComponent as CustomFooterComponent } from '../../themes/custom/app/footer/footer.component';

import { RootComponent as CustomRootComponent } from '../../themes/custom/app/root/root.component';

/**
 * Hardcoded proxy for Custom Root to avoid dynamic insertion flickers
 */
@Component({
  selector: 'ds-root',
  styleUrls: ['../../themes/custom/app/root/root.component.scss'],
  templateUrl: '../../themes/custom/app/root/root.component.html',
  animations: [slideSidebarPadding],
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    NotificationsBoardComponent,
    RouterOutlet,
    SystemWideAlertBannerComponent,
    ThemedAdminSidebarComponent,
    ThemedBreadcrumbsComponent,
    ThemedFooterComponent,
    ThemedHeaderNavbarWrapperComponent,
    ThemedLoadingComponent,
    TranslateModule,
    SediciPostFooterComponent,
    CustomFooterComponent,
  ],
})
export class ThemedRootComponent extends CustomRootComponent {
  @Input() shouldShowFullscreenLoader: boolean;
  @Input() shouldShowRouteLoader: boolean;
}