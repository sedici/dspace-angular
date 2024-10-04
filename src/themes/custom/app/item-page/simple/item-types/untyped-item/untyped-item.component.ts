import {
  AsyncPipe,
  NgIf,
  NgFor,
  NgStyle,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { TruncatableComponent } from 'src/app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from 'src/app/shared/truncatable/truncatable-part/truncatable-part.component';
import { TabbedContentComponent } from './tabbed-content.component';
import { SediciDateMetadataValuesComponent } from '../../field-components/date-metadata-values/sedici-date-metadata-values.component';
import { SediciLanguageMetadataValuesComponent } from '../../field-components/language-metadata-values/sedici-language-metadata-values.component';
import { setPersistentIdentifiers } from 'src/app/shared/utils/persistent.identifier';
import { SediciTruncatableGenericItemPageFieldComponent } from './sedici-truncatable-generic-item-page-field';

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
    DsoEditMenuComponent,
    GenericItemPageFieldComponent,
    ItemPageUriFieldComponent,
    RouterLink,
    AsyncPipe,
    TranslateModule,
    LanguageSwitcherComponent,
    BadgeMetadataValuesComponent,
    TruncatableComponent,
    TruncatablePartComponent,
    TabbedContentComponent,
    SediciDateMetadataValuesComponent,
    SediciLanguageMetadataValuesComponent,
    SediciContextBadgeComponent,
    SediciTruncatableGenericItemPageFieldComponent,
  ],
})
export class UntypedItemComponent extends BaseComponent {
  subtype;
  identifierOtherMetadataName = ['dc.identifier.uri', 'sedici.identifier.other'];
  itemIdentifiers: { mdValue: MetadataValue, label: string, url: string }[];

  ngOnInit() {
    super.ngOnInit();
    const abstracts = this.object.metadata['dc.description.abstract'];
    this.subtype = this.object.metadata['sedici.subtype'][0]?.value;
    this.itemIdentifiers = setPersistentIdentifiers(this.object, this.identifierOtherMetadataName);
  }
}
