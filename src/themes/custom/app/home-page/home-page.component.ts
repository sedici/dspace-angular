import { CollectionDataService } from './../../../../app/core/data/collection-data.service';
import { CommunityDataService } from './../../../../app/core/data/community-data.service';
import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  filter,
  map,
  mergeMap,
} from 'rxjs/operators';
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
import { HomeSliderComponent, SliderItem, SliderItem2 } from './sedici-home-slider/home-slider.component';
import {
  APP_CONFIG,
  AppConfig,
} from 'src/config/app-config.interface';
import { ActivatedRoute } from '@angular/router';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { getAllSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { Community } from 'src/app/core/shared/community.model';
import { ComcolPageLogoComponent } from 'src/app/shared/comcol/comcol-page-logo/comcol-page-logo.component';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { Collection } from 'src/app/core/shared/collection.model';
import { hasValue } from 'src/app/shared/empty.util';
import { FollowLinkConfig, followLink } from 'src/app/shared/utils/follow-link-config.model';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { COMMUNITY_PAGE_LINKS_TO_FOLLOW } from 'src/app/community-page/community-page.resolver';
@Component({
  selector: 'ds-themed-home-page',
  styleUrls: ['./home-page.component.scss'],
  // styleUrls: ['../../../../app/home-page/home-page.component.scss'],
  templateUrl: './home-page.component.html',
  // templateUrl: '../../../../app/home-page/home-page.component.html',
  standalone: true,
  imports: [ThemedHomeNewsComponent, ComcolPageLogoComponent, NgTemplateOutlet, NgIf, ViewTrackerComponent, ThemedSearchFormComponent, ThemedTopLevelCommunityListComponent, RecentItemListComponent, AsyncPipe, TranslateModule, NgClass, SuggestionsPopupComponent, ThemedConfigurationSearchPageComponent, PageWithSidebarComponent, HomeCoarComponent, HomeSliderComponent],
})
export class HomePageComponent extends BaseComponent {

  aux = 0;
  numCollection = this.appConfig.highlightCollections.length;
  highlightCollections: any;
  collectionName: String;
  logo: Bitstream;
  logoRD$: Observable<RemoteData<Bitstream>>;
  communityRD$: Observable<RemoteData<Community>>;
  collectionRD$: Observable<RemoteData<Collection>>;
  //linksToFollow: FollowLinkConfig<DSpaceObject>[] = COMMUNITY_PAGE_LINKS_TO_FOLLOW as FollowLinkConfig<DSpaceObject>[];
  comlinksToFollow: FollowLinkConfig<Community>[] = [
    followLink('logo'),
  ];
  collinksToFollow: FollowLinkConfig<Collection>[] = [
    followLink('logo'),
  ];

  colecciones:Array<SliderItem> = [
    {
      title: "Revistas",
      img: "assets/custom/images/revistas.png",
      href: "",
      description: "Tesis de grado, postgrado y otros documentos",
    } as SliderItem,{
      title: "Eventos",
      img: "assets/custom/images/eventos.png",
      href: "",
      description: "Tesis de grado, postgrado y otros documentos"
    } as SliderItem,{
      title: "Libros",
      img: "assets/custom/images/libros2.png",
      href: "",
      description: "Tesis de grado, postgrado y otros documentos"
    } as SliderItem,{
      title: "Tesis",
      img: "assets/custom/images/tesis.png",
      href: "",
      description: "Tesis de grado, postgrado y otros documentos"
    } as SliderItem
  ];

  carrousel2 :SliderItem2[][] = [];

  constructor(
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    protected route: ActivatedRoute,
    protected comuds: CommunityDataService,
    protected collds: CollectionDataService,
    protected cdr: ChangeDetectorRef
  ) {
    super(appConfig, route);
    this.highlightCollections = this.appConfig.highlightCollections;
  }


  ngOnInit(): void {
    super.ngOnInit();
    const resultado = [];
    for (let i = 0; i < this.appConfig.highlightCollections.length; i += 5) {
      const subarreglo = this.appConfig.highlightCollections.slice(i, i + 5);
      resultado.push(subarreglo);
    }
    for (const arreglo of resultado){
      const slider = [];
      for (const uuid of arreglo){
        if(uuid.type == "com"){
          this.communityRD$ = this.comuds.findById(
            uuid.id,
            true,
            true,
            ...this.comlinksToFollow,
            );
          this.communityRD$.pipe(
            getFirstSucceededRemoteDataPayload(),
          ).subscribe((community: Community) => {
            slider.push(
              {title: community.name,
              href:"/communities/"+uuid.id,
              img: community.logo}as SliderItem2
              );
            console.log(this.carrousel2);
            this.logoRD$ = community.logo;
            this.aux += 1;
            console.log(this.aux);
            this.cdr.detectChanges();
          });
        }else{
          this.collectionRD$ = this.collds.findById(
            uuid.id,
            true,
            true,
            ...this.collinksToFollow,
            );
          this.collectionRD$.pipe(
            getFirstSucceededRemoteDataPayload(),
          ).subscribe((collection: Collection) => {
            slider.push(
              {title: collection.name,
              href:"/collections/"+uuid.id,
              img: collection.logo}as SliderItem2
              );
            console.log(this.carrousel2);
            this.logoRD$ = collection.logo;
            this.aux += 1;
            console.log(this.aux);
            this.cdr.detectChanges();
          });
        }
      }
      this.carrousel2.push(slider)
    }
  }

}
