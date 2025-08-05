import {
  AsyncPipe,
  NgIf,
  NgFor,
  NgStyle,
  NgClass,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UntypedItemComponent } from 'src/themes/custom/app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { DsoEditMenuComponent } from 'src/app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { GenericItemPageFieldComponent } from '../simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ItemPageUriFieldComponent } from '../simple/field-components/specific-field/uri/item-page-uri-field.component';
import { LanguageSwitcherComponent } from 'src/themes/custom/app/item-page/simple/item-types/untyped-item/language-switcher.component';
import { BadgeMetadataValuesComponent } from 'src/themes/custom/app/item-page/simple/field-components/badge-metadata-values/badge-metadata-values.component';
import { TabbedContentComponent } from 'src/themes/custom/app/item-page/simple/item-types/untyped-item/tabbed-content.component';
import { SediciContextBadgeComponent } from 'src/themes/custom/app/shared/object-collection/shared/badges/sedici-context-badge/sedici-context-badge.component';
import { SediciTruncatableGenericItemPageFieldComponent } from 'src/themes/custom/app/item-page/simple/item-types/untyped-item/sedici-truncatable-generic-item-page-field';
import { SediciContextComponent } from 'src/themes/custom/app/item-page/simple/field-components/context/sedici-context.component';
import { SediciCitationComponent } from 'src/themes/custom/app/item-page/simple/field-components/citation/sedici-citation.component';
import { SediciShareButtonsComponent } from 'src/themes/custom/app/item-page/simple/field-components/share-buttons/sedici-share-buttons.component';
import { ExpandableMetadataComponent } from 'src/themes/custom/app/item-page/simple/item-types/untyped-item/expandable-metadata';
import { TruncatableComponent } from 'src/app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from 'src/app/shared/truncatable/truncatable-part/truncatable-part.component';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { RouteService } from 'src/app/core/services/route.service';
import { Router } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'ds-sedici-certificate',
  templateUrl: './sedici-item-certificate.html',
  styleUrls: ['./sedici-item-certificate.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgStyle,
    NgClass,
    DsoEditMenuComponent,
    GenericItemPageFieldComponent,
    ItemPageUriFieldComponent,
    RouterLink,
    AsyncPipe,
    TranslateModule,
    LanguageSwitcherComponent,
    BadgeMetadataValuesComponent,
    TabbedContentComponent,
    SediciContextBadgeComponent,
    SediciTruncatableGenericItemPageFieldComponent,
    SediciContextComponent,
    SediciCitationComponent,
    NgbModule,
    SediciShareButtonsComponent,
    ExpandableMetadataComponent,
    TruncatableComponent,
    TruncatablePartComponent,
    CommonModule,
    QRCodeComponent,
  ], // Solo los necesarios si el HTML nuevo necesita alguno en particular
})
export class SediciCertificate extends UntypedItemComponent implements OnInit {

  fechaActual: Date;

  public user$: Observable<EPerson>;

  public ruta: String;

  constructor(
      protected authService: AuthService,
      private service: NgbModal,
      protected routeService: RouteService,
      protected router: Router
    ) {
      super(service,routeService, router);
    }

  override ngOnInit(): void {
    super.ngOnInit();
    this.fechaActual = new Date();
    this.user$ = this.authService.getAuthenticatedUserFromStore();
    this.ruta = window.location.href;
    this.ruta = this.ruta.split('/').slice(0, -1).join('/');
  }
}
