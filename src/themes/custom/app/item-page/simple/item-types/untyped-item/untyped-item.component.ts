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
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Context } from '../../../../../../../app/core/shared/context.model';
import { Item } from '../../../../../../../app/core/shared/item.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import { GenericItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ItemPageUriFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';
import { UntypedItemComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { DsoEditMenuComponent } from '../../../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { SediciContextBadgeComponent } from 'src/themes/custom/app/shared/object-collection/shared/badges/sedici-context-badge/sedici-context-badge.component';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { MetadataValue } from 'src/app/core/shared/metadata.models';
import { BadgeMetadataValuesComponent } from '../../field-components/badge-metadata-values/badge-metadata-values.component';
import { TabbedContentComponent } from './tabbed-content.component';
import { SediciDateMetadataValuesComponent } from '../../field-components/date-metadata-values/sedici-date-metadata-values.component';
import { SediciLanguageMetadataValuesComponent } from '../../field-components/language-metadata-values/sedici-language-metadata-values.component';
import { setPersistentIdentifiers } from 'src/app/shared/utils/persistent.identifier';
import { SediciTruncatableGenericItemPageFieldComponent } from './sedici-truncatable-generic-item-page-field';
import { SediciContextComponent } from '../../field-components/context/sedici-context.component';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SediciCitationComponent } from '../../field-components/citation/sedici-citation.component';
import { RouteService } from 'src/app/core/services/route.service';
import { Router } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SediciShareButtonsComponent } from '../../field-components/share-buttons/sedici-share-buttons.component';

import { LrwLAReferenciaComponent } from '../../field-components/usage-stats copy/lrw-lareferencia.component';

import { ExpandableMetadataComponent } from './expandable-metadata';
/**
 * Component that represents an untyped Item page
 */
@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'custom')
@Component({
  selector: 'ds-untyped-item',
  styleUrls: ['./untyped-item.component.scss'],
  // styleUrls: ['../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.scss',],
  templateUrl: './untyped-item.component.html',
  // templateUrl: '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    SediciDateMetadataValuesComponent,
    SediciLanguageMetadataValuesComponent,
    SediciContextBadgeComponent,
    SediciTruncatableGenericItemPageFieldComponent,
    SediciContextComponent,    
    SediciCitationComponent,
    NgbModule,
    SediciShareButtonsComponent,
    LrwLAReferenciaComponent,
    ExpandableMetadataComponent,
  ],
})
export class UntypedItemComponent extends BaseComponent {
  subtype;
  identifierOtherMetadataName = ['dc.identifier.uri', 'sedici.identifier.other'];
  itemIdentifiers: { mdValue: MetadataValue, label: string, url: string }[];

  @ViewChild('tabbedContent', { read: ElementRef }) tabbedContentElement: ElementRef;
  @ViewChild('tabbedContent') tabbedContentComponent: TabbedContentComponent;

  constructor(private modalService: NgbModal, protected routeService: RouteService, protected router: Router) {
    super(routeService, router);
  }

  openModalCitation() {
    this.modalService.open(SediciCitationComponent, {
      centered: true, // Centra el modal
    });
  }

  openModalShareButtons() {
    const modalRef = this.modalService.open(SediciShareButtonsComponent, {
      centered: true, // Centra el modal
    });
    modalRef.componentInstance.link = this.object.firstMetadataValue('dc.identifier.uri');
    modalRef.componentInstance.title = this.object.firstMetadataValue('dc.title');
    modalRef.componentInstance.type = this.object.firstMetadataValue('sedici.subtype') || this.object.firstMetadataValue('dc.type');
  }

  get hasMetadata(): boolean {
    return this.hasField('sedici.description.note') ||
           this.hasField('dc.format') ||
           this.hasField('dc.format.medium');
  }

  // Comprueba si el campo existe y tiene contenido
  private hasField(field: string): boolean {
    const value = this.object.metadata[field];
    return value && value.length > 0;
  }

  ngOnInit() {
    super.ngOnInit();
    this.subtype = this.object.metadata['sedici.subtype'][0]?.value;
    this.itemIdentifiers = setPersistentIdentifiers(this.object, this.identifierOtherMetadataName);
  }
}
