
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';


import { ThemedHomeNewsComponent } from '../../../../app/home-page/home-news/themed-home-news.component';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';

import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions/popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from '../../../../app/search-page/themed-configuration-search-page.component';

import { ViewTrackerResolverService } from '../../../../app/statistics/angulartics/dspace/view-tracker-resolver.service';

import { ComcolGridComponent } from './comcol-grid/comcol-grid.component';

interface ExploracionDestacada {
  title: string;
  img: string;
  href: string;
  description?: string;
  queryParams?: {[key: string]: any};
}
@Component({
  selector: 'ds-themed-home-page',
  styleUrls: ['./home-page.component.scss'],
  // styleUrls: ['../../../../app/home-page/home-page.component.scss'],
  templateUrl: './home-page.component.html',
  // templateUrl: '../../../../app/home-page/home-page.component.html',
  standalone: true,
  imports: [ThemedHomeNewsComponent, TranslateModule, SuggestionsPopupComponent, ThemedConfigurationSearchPageComponent, ComcolGridComponent],
})
export class HomePageComponent extends BaseComponent {

  exploraciones:Array<ExploracionDestacada> = [
    {
      title: "journals",
      img: "assets/custom/images/revistas.svg",
      href: "/handle/10915/51",
    } as ExploracionDestacada,
    {
      title: "events",
      img: "assets/custom/images/eventos.svg",
      href: "/handle/10915/1038",
    } as ExploracionDestacada,
    {
      title: "books",
      img: "assets/custom/images/libros.svg",
      href: "/search",
      queryParams: {
        "spc.page": 1,
        "f.itemtype": "Libro,equals",
        "spc.sf": "dc.date.accessioned",
        "spc.sd": "DESC"
      }
    } as ExploracionDestacada,
    {
      title: "data",
      img: "assets/custom/images/datos.svg",
      href: "/search",
      queryParams: {
        "spc.page": 1,
        "f.itemtype": "Conjunto de datos,equals",
        "spc.sf": "dc.date.accessioned",
        "spc.sd": "DESC"
      }
    } as ExploracionDestacada,
  ];

  getHoverImageSrc(originalSrc: string): string {
    const lastDotIndex = originalSrc.lastIndexOf('.');
    const basePath = originalSrc.substring(0, lastDotIndex);
    const extension = originalSrc.substring(lastDotIndex);
    return `${basePath}-w${extension}`;
  }
}
