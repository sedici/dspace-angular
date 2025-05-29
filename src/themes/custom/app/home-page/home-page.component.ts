import { CollectionDataService } from './../../../../app/core/data/collection-data.service';
import { CommunityDataService } from './../../../../app/core/data/community-data.service';
import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgTemplateOutlet,
  NgFor,
} from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Component,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { RemoteData } from 'src/app/core/data/remote-data';

import { HomeCoarComponent } from '../../../../app/home-page/home-coar/home-coar.component';
import { ThemedHomeNewsComponent } from '../../../../app/home-page/home-news/themed-home-news.component';
import { HomePageComponent as BaseComponent } from '../../../../app/home-page/home-page.component';
import { RecentItemListComponent } from '../../../../app/home-page/recent-item-list/recent-item-list.component';
import { ThemedTopLevelCommunityListComponent } from '../../../../app/home-page/top-level-community-list/themed-top-level-community-list.component';
import { SuggestionsPopupComponent } from '../../../../app/notifications/suggestions-popup/suggestions-popup.component';
import { ThemedConfigurationSearchPageComponent } from '../../../../app/search-page/themed-configuration-search-page.component';
import { ThemedSearchFormComponent } from '../../../../app/shared/search-form/themed-search-form.component';
import { PageWithSidebarComponent } from '../../../../app/shared/sidebar/page-with-sidebar.component';
import { ViewTrackerComponent } from '../../../../app/statistics/angulartics/dspace/view-tracker.component';
import { HomeSliderComponent, SliderItem } from './sedici-home-slider/home-slider.component';
import {
  APP_CONFIG,
  AppConfig,
} from 'src/config/app-config.interface';
import { ActivatedRoute } from '@angular/router';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { Community } from 'src/app/core/shared/community.model';
import { ComcolPageLogoComponent } from 'src/app/shared/comcol/comcol-page-logo/comcol-page-logo.component';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { Collection } from 'src/app/core/shared/collection.model';
import { FollowLinkConfig, followLink } from 'src/app/shared/utils/follow-link-config.model';

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
  imports: [ThemedHomeNewsComponent, ComcolPageLogoComponent, NgTemplateOutlet, NgIf, NgFor, RouterLink, ViewTrackerComponent, ThemedSearchFormComponent, ThemedTopLevelCommunityListComponent, RecentItemListComponent, AsyncPipe, TranslateModule, NgClass, SuggestionsPopupComponent, ThemedConfigurationSearchPageComponent, PageWithSidebarComponent, HomeCoarComponent, HomeSliderComponent],
})
export class HomePageComponent extends BaseComponent {

  highlightCollections: any;
  facultades: any;
  pregrado: any;
  presidencia: any;
  collectionName: String;
  logo: Bitstream;
  logoRD$: Observable<RemoteData<Bitstream>>;
  communityRD$: Observable<RemoteData<Community>>;
  collectionRD$: Observable<RemoteData<Collection>>;
  comlinksToFollow: FollowLinkConfig<Community>[] = [
    followLink('logo'),
  ];
  collinksToFollow: FollowLinkConfig<Collection>[] = [
    followLink('logo'),
  ];

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

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    protected route: ActivatedRoute,
    protected comuds: CommunityDataService,
    protected collds: CollectionDataService,
    protected cdr: ChangeDetectorRef
  ) {
    super(appConfig, route);
    this.highlightCollections = this.appConfig.highlightCollections;
    this.facultades = this.appConfig.facultades;
    this.pregrado = this.appConfig.pregrado;
    this.presidencia = this.appConfig.presidencia;
  }

  coleccionesDestacadas: SliderItem[] = [];
  facultadesComunidades: SliderItem[] = [];
  pregradoComunidades: SliderItem[] = [];
  presidenciaComunidades: SliderItem[] = [];

  ngOnInit(): void {
    super.ngOnInit();
    this.coleccionesDestacadas = this.getComColInfo(this.highlightCollections);
    this.facultadesComunidades = this.getComColInfo(this.facultades);
    this.pregradoComunidades = this.getComColInfo(this.pregrado);
    this.presidenciaComunidades = this.getComColInfo(this.presidencia);
  }

  getComColInfo(array): SliderItem[] {
    let comcolArray: SliderItem[] = [];
    for (const comcol of array) {
      if(comcol.type == "com"){
        this.communityRD$ = this.comuds.findById(
          comcol.id,
          true,
          true,
          ...this.comlinksToFollow,
          );
        this.communityRD$.pipe(
          getFirstSucceededRemoteDataPayload(),
        ).subscribe((community: Community) => {
          community.logo.subscribe(imageUrl => {
            comcolArray.push(
              {
                title: community.name,
                href:"/communities/" + comcol.id,
                img: imageUrl.payload._links.content.href,
                description: community.name
              } as SliderItem
            );
            this.cdr.detectChanges();
          });
        });
      } else {
        this.collectionRD$ = this.collds.findById(
          comcol.id,
          true,
          true,
          ...this.collinksToFollow,
          );
        this.collectionRD$.pipe(
          getFirstSucceededRemoteDataPayload(),
        ).subscribe((collection: Collection) => {
          collection.logo.subscribe(imageUrl => {
            comcolArray.push(
              {
                title: collection.name,
                href:"/collections/" + comcol.id,
                img: imageUrl.payload._links.content.href,
                description: collection.name
              } as SliderItem
            );
            this.cdr.detectChanges();
          });
        });
      }
    }
    return comcolArray;
  }  
}
