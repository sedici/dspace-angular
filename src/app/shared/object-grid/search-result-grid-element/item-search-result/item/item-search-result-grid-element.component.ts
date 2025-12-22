import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { DSONameService } from '../../../../../core/breadcrumbs/dso-name.service';
import { BitstreamDataService } from '../../../../../core/data/bitstream-data.service';
import { Item } from '../../../../../core/shared/item.model';
import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { getItemPageRoute } from '../../../../../item-page/item-page-routing-paths';
import { ThemedThumbnailComponent } from '../../../../../thumbnail/themed-thumbnail.component';
import { focusShadow } from '../../../../animations/focus';
import { ThemedBadgesComponent } from '../../../../object-collection/shared/badges/themed-badges.component';
import { ItemSearchResult } from '../../../../object-collection/shared/item-search-result.model';
import { listableObjectComponent } from '../../../../object-collection/shared/listable-object/listable-object.decorator';
import { TruncatableComponent } from '../../../../truncatable/truncatable.component';
import { TruncatableService } from '../../../../truncatable/truncatable.service';
import { TruncatablePartComponent } from '../../../../truncatable/truncatable-part/truncatable-part.component';
import { SearchResultGridElementComponent } from '../../search-result-grid-element.component';
import { ThemedAccessStatusBadgeComponent } from 'src/app/shared/object-collection/shared/badges/access-status-badge/themed-access-status-badge.component';

@listableObjectComponent('PublicationSearchResult', ViewMode.GridElement)
@listableObjectComponent(ItemSearchResult, ViewMode.GridElement)
@Component({
  selector: 'ds-item-search-result-grid-element',
  styleUrls: ['./item-search-result-grid-element.component.scss'],
  templateUrl: './item-search-result-grid-element.component.html',
  animations: [focusShadow],
  imports: [
    AsyncPipe,
    RouterLink,
    ThemedBadgesComponent,
    ThemedThumbnailComponent,
    TranslateModule,
    TruncatableComponent,
    TruncatablePartComponent,
    ThemedAccessStatusBadgeComponent,
  ],
})
/**
 * The component for displaying a grid element for an item search result of the type Publication
 */
export class ItemSearchResultGridElementComponent extends SearchResultGridElementComponent<ItemSearchResult, Item> implements OnInit {
  /**
   * Route to the item's page
   */
  itemPageRoute: string;

  dsoTitle: string;

  authors: string[] = [];

  constructor(
    public dsoNameService: DSONameService,
    protected truncatableService: TruncatableService,
    protected bitstreamDataService: BitstreamDataService,
  ) {
    super(dsoNameService, truncatableService, bitstreamDataService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.itemPageRoute = getItemPageRoute(this.dso);
    this.dsoTitle = this.dsoNameService.getHitHighlights(this.object, this.dso);
    this.getFirstAvailableAuthors();
  }

  getYear(): string {
    let dateString = this.firstMetadataValue('dc.date.issued') || this.firstMetadataValue('dc.date.created') || this.firstMetadataValue('sedici.date.exposure');
    if (dateString) {
      return dateString.split('-')[0];
    }
    return '';
  }

  getFirstAvailableAuthors(): void {
    const creators = this.dso.allMetadata(['sedici.creator.person', 'sedici.creator.interprete']);
    if (creators.length > 0) {
      this.authors = this.allMetadataValues(['sedici.creator.person', 'sedici.creator.interprete']);
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
    this.dsoTitle = this.dsoNameService.getHitHighlights(this.object, this.dso, true);
  }
}
