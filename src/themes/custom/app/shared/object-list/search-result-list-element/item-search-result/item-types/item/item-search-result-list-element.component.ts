import {
  AsyncPipe,
  NgClass,
} from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

import { Context } from '../../../../../../../../../app/core/shared/context.model';
import { ViewMode } from '../../../../../../../../../app/core/shared/view-mode.model';
import { ThemedBadgesComponent } from '../../../../../../../../../app/shared/object-collection/shared/badges/themed-badges.component';
import { ItemSearchResult } from '../../../../../../../../../app/shared/object-collection/shared/item-search-result.model';
import { listableObjectComponent } from '../../../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemSearchResultListElementComponent as BaseComponent } from '../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { TruncatableComponent } from '../../../../../../../../../app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from '../../../../../../../../../app/shared/truncatable/truncatable-part/truncatable-part.component';
import { ThemedThumbnailComponent } from '../../../../../../../../../app/thumbnail/themed-thumbnail.component';
import { SediciContextComponent } from 'src/themes/custom/app/item-page/simple/field-components/context/sedici-context.component';
import { ThemedAccessStatusBadgeComponent } from 'src/app/shared/object-collection/shared/badges/access-status-badge/themed-access-status-badge.component';

@listableObjectComponent('PublicationSearchResult', ViewMode.ListElement, Context.Any, 'custom')
@listableObjectComponent(ItemSearchResult, ViewMode.ListElement, Context.Any, 'custom')
@Component({
  selector: 'ds-item-search-result-list-element',
  styleUrls: ['./item-search-result-list-element.component.scss'],
  // styleUrls: ['../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component.scss'],
  templateUrl: './item-search-result-list-element.component.html',
  // templateUrl: '../../../../../../../../../app/shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    TranslateModule,
    RouterLink,
    ThemedBadgesComponent,
    ThemedThumbnailComponent,
    TruncatableComponent,
    TruncatablePartComponent,
    SediciContextComponent,
    ThemedAccessStatusBadgeComponent,
  ],
})
export class ItemSearchResultListElementComponent extends BaseComponent {
  authors: string[] = [];

  ngOnInit(): void {
    super.ngOnInit();
    this.getFirstAvailableAuthors();
  }

  getYear(): string | null {
    const dateValue = this.firstMetadataValue('dc.date.issued') || this.firstMetadataValue('dc.date.created') || this.firstMetadataValue('dc.date.available') || this.firstMetadataValue('dc.date.exposure');
    if (!dateValue) {
      return null;
    }
    const regex = /^\d{4}/;
    const match = dateValue.match(regex);
    if (match) {
      return match[0];
    }
    return dateValue;
  }

  get displayedAuthors(): string[] {
    return this.authors.slice(0, 4);
  }

  get hasMoreAuthors(): boolean {
    return this.authors.length > 4;
  }


  getFirstAvailableAuthors(): void {
    const creators = this.dso.allMetadata(['sedici.creator.person']);
    if (creators.length > 0) {
      this.authors = this.allMetadataValues(['sedici.creator.person']);
    } else {
      const compilers = this.dso.allMetadata(['sedici.contributor.compiler']);
      if (compilers.length > 0) {
        this.authors = this.allMetadataValues(['sedici.contributor.compiler']);
      } else {
        const editors = this.dso.allMetadata(['sedici.contributor.editor']);
        if (editors.length > 0) {
          this.authors = this.allMetadataValues(['sedici.contributor.editor']);
        }
      }
    }  
  }
}