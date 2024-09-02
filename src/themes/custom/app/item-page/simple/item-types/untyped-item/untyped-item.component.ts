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
import { CollectionsComponent } from '../../../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedMediaViewerComponent } from '../../../../../../../app/item-page/media-viewer/themed-media-viewer.component';
import { MiradorViewerComponent } from '../../../../../../../app/item-page/mirador-viewer/mirador-viewer.component';
import { ThemedFileSectionComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/themed-file-section.component';
import { ItemPageAbstractFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/abstract/item-page-abstract-field.component';
import { ItemPageCcLicenseFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component';
import { ItemPageDateFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/date/item-page-date-field.component';
import { ItemPageAuthorFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/author/item-page-author-field.component';
import { GenericItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemPageUriFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';
import { UntypedItemComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { ThemedMetadataRepresentationListComponent } from '../../../../../../../app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component';
import { DsoEditMenuComponent } from '../../../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ThemedResultsBackButtonComponent } from '../../../../../../../app/shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../../../../app/thumbnail/themed-thumbnail.component';
import { MetadataValuesComponent } from 'src/app/item-page/field-components/metadata-values/metadata-values.component';
import { MetadataRepresentationListComponent } from '../../metadata-representation-list/metadata-representation-list.component';
import { FileSectionComponent } from '../../field-components/file-section/file-section.component';
import { MediaViewerComponent } from '../../../media-viewer/media-viewer.component';
import { ThumbnailComponent } from 'src/themes/custom/app/thumbnail/thumbnail.component';
import { ResultsBackButtonComponent } from 'src/themes/custom/app/shared/results-back-button/results-back-button.component';
import { SediciContextBadgeComponent } from 'src/themes/custom/app/shared/object-collection/shared/badges/sedici-context-badge/sedici-context-badge.component';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { ApaCitationComponent } from './apa-citation.component';
import { MetadataValue } from 'src/app/core/shared/metadata.models';
import { BadgeMetadataValuesComponent } from '../../field-components/badge-metadata-values/badge-metadata-values.component';
import { TruncatableComponent } from 'src/app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from 'src/app/shared/truncatable/truncatable-part/truncatable-part.component';
import { TabbedContentComponent } from './tabbed-content.component';
import { SediciDateMetadataValuesComponent } from '../../field-components/date-metadata-values/sedici-date-metadata-values.component';
import { SediciLanguageMetadataValuesComponent } from '../../field-components/language-metadata-values/sedici-language-metadata-values.component';
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
    ThemedResultsBackButtonComponent,
    MiradorViewerComponent,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    MetadataFieldWrapperComponent,
    ThemedThumbnailComponent,
    ThemedMediaViewerComponent,
    ThemedFileSectionComponent,
    ItemPageDateFieldComponent,
    ThemedMetadataRepresentationListComponent,
    GenericItemPageFieldComponent,
    ItemPageAbstractFieldComponent,
    ItemPageUriFieldComponent,
    CollectionsComponent,
    RouterLink,
    AsyncPipe,
    TranslateModule,
    ItemPageCcLicenseFieldComponent,
    MetadataValuesComponent,
    MetadataRepresentationListComponent,
    FileSectionComponent,
    MediaViewerComponent,
    ThumbnailComponent,
    ResultsBackButtonComponent,
    LanguageSwitcherComponent,
    ItemPageAuthorFieldComponent,
    BadgeMetadataValuesComponent,
    TruncatableComponent,
    TruncatablePartComponent,
    ApaCitationComponent,
    TabbedContentComponent,
    SediciDateMetadataValuesComponent,
    SediciLanguageMetadataValuesComponent,
    SediciContextBadgeComponent,
  ],
})
export class UntypedItemComponent extends BaseComponent {
  hasMultipleLanguages: boolean;
  subtype;
  identifierOtherMetadataName = ['dc.identifier.uri', 'sedici.identifier.other'];
  itemIdentifiers: { mdValue: MetadataValue, label: string }[];

  ngOnInit() {
    super.ngOnInit();
    const abstracts = this.object.metadata['dc.description.abstract'];
    this.hasMultipleLanguages = abstracts && abstracts.length > 1;
    this.subtype = this.object.metadata['sedici.subtype'][0]?.value;
    this.setIdentifierOtherValues();
  }

  setIdentifierOtherValues(): void {
    this.itemIdentifiers = [];
    const length = this.itemIdentifiers.push({
      mdValue: new MetadataValue(),
      label: 'HDL'
    });
    this.itemIdentifiers[length - 1].mdValue.value = this.object?.handle;
    this.object.allMetadata(this.identifierOtherMetadataName).forEach(
      (mdValue, index) => {
        let charIndex = -1;
        let label = '';
        if (mdValue.value.includes(this.object?.handle)) {
          if (mdValue.value.includes('doi')) {
            label = 'DOI';
          } else {
            return;
          }
        } else {
          if (!mdValue.value.startsWith('http')) {
            const splitChar = mdValue.value.includes(':') ? ':' : ' ';
            charIndex = mdValue.value.indexOf(splitChar);
            label = mdValue.value.substring(0, charIndex).toUpperCase();
          } else {
            label = 'URL';
          }
        }
        const value = mdValue.value.substring(charIndex + 1).trim();
        const identifierListLength = this.itemIdentifiers.push({
          mdValue: new MetadataValue(),
          label: label
        });
        this.itemIdentifiers[identifierListLength - 1].mdValue.value = value;
      }
    );
  }
}
