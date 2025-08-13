import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgTemplateOutlet,
  NgFor,
} from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { HomeCoarComponent } from '../../../../app/home-page/home-coar/home-coar.component';
import { ThemedHomeNewsComponent } from '../../../../app/home-page/home-news/themed-home-news.component';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { RecentItemListComponent } from '../../../../app/home-page/recent-item-list/recent-item-list.component';
import { ThemedTopLevelCommunityListComponent } from '../../../../app/home-page/top-level-community-list/themed-top-level-community-list.component';
import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions-popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from '../../../../app/search-page/themed-configuration-search-page.component';
import { ThemedSearchFormComponent } from '../../../../app/shared/search-form/themed-search-form.component';
import { PageWithSidebarComponent } from '../../../../app/shared/sidebar/page-with-sidebar.component';
import { ViewTrackerResolverService } from '../../../../app/statistics/angulartics/dspace/view-tracker-resolver.service';
import { HomeSliderComponent } from './sedici-home-slider/home-slider.component';
import { ComcolPageLogoComponent } from 'src/app/shared/comcol/comcol-page-logo/comcol-page-logo.component';
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
  imports: [ThemedHomeNewsComponent, ComcolPageLogoComponent, NgTemplateOutlet, NgIf, NgFor, RouterLink, ThemedSearchFormComponent, ThemedTopLevelCommunityListComponent, RecentItemListComponent, AsyncPipe, TranslateModule, NgClass, SuggestionsPopupComponent, ThemedConfigurationSearchPageComponent, PageWithSidebarComponent, HomeCoarComponent, HomeSliderComponent, ComcolGridComponent],
})
export class HomePageComponent extends BaseComponent {

  exploraciones:Array<ExploracionDestacada> = [
    {
      title: "Revistas",
      img: "assets/custom/images/revistas.png",
      href: "/handle/10915/51",
      description: "123.456",
    } as ExploracionDestacada,
    {
      title: "Eventos",
      img: "assets/custom/images/eventos.png",
      href: "/handle/10915/1038",
      description: "123.456"
    } as ExploracionDestacada,
    {
      title: "Libros",
      img: "assets/custom/images/libros2.png",
      href: "/search",
      description: "123.456",
      queryParams: {
        "spc.page": 1,
        "f.itemtype": "Libro,equals",
        "spc.sf": "dc.date.accessioned",
        "spc.sd": "DESC"
      }
    } as ExploracionDestacada,
    {
      title: "Datos",
      img: "assets/custom/images/datos.png",
      href: "/search",
      description: "123.456",
      queryParams: {
        "spc.page": 1,
        "f.itemtype": "Conjunto de datos,equals",
        "spc.sf": "dc.date.accessioned",
        "spc.sd": "DESC"
      }
    } as ExploracionDestacada,
  ];
}
