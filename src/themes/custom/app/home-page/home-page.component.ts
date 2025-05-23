import { CollectionDataService } from './../../../../app/core/data/collection-data.service';
import { CommunityDataService } from './../../../../app/core/data/community-data.service';
import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgTemplateOutlet,
  NgFor,
} from '@angular/common';
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

interface ColeccionDestacada {
  title: string;
  img: string;
  href: string;
  description?: string;
}
@Component({
  selector: 'ds-themed-home-page',
  styleUrls: ['./home-page.component.scss'],
  // styleUrls: ['../../../../app/home-page/home-page.component.scss'],
  templateUrl: './home-page.component.html',
  // templateUrl: '../../../../app/home-page/home-page.component.html',
  standalone: true,
  imports: [ThemedHomeNewsComponent, ComcolPageLogoComponent, NgTemplateOutlet, NgIf, NgFor, ViewTrackerComponent, ThemedSearchFormComponent, ThemedTopLevelCommunityListComponent, RecentItemListComponent, AsyncPipe, TranslateModule, NgClass, SuggestionsPopupComponent, ThemedConfigurationSearchPageComponent, PageWithSidebarComponent, HomeCoarComponent, HomeSliderComponent],
})
export class HomePageComponent extends BaseComponent {

  aux = 0;
  numCollection = this.appConfig.highlightCollections.length;
  highlightCollections: any;
  academicUnits: any;
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

  colecciones:Array<SliderItem> = [
    {
      title: "Revistas",
      img: "assets/custom/images/revistas.png",
      href: "",
      description: "123.456",
    } as SliderItem,{
      title: "Eventos",
      img: "assets/custom/images/eventos.png",
      href: "",
      description: "123.456"
    } as SliderItem,{
      title: "Libros",
      img: "assets/custom/images/libros2.png",
      href: "",
      description: "123.456"
    } as SliderItem,
    // {
    //   title: "Tesis",
    //   img: "assets/custom/images/tesis.png",
    //   href: "",
    //   description: "123.456"
    // } as SliderItem
  ];

  coleccionesDestacadas: ColeccionDestacada[] = [
    {
      title: "Transparencia activa",
      img: "assets/custom/images/colecciones/transparencia.png",
      href: "/collections/transparencia",
    },
    {
      title: "Radio Universidad",
      img: "assets/custom/images/colecciones/radio.png",
      href: "/communities/3029e173-44fa-4ab8-a76a-3488c390fb06",
    },
    {
      title: "Red de Museos",
      img: "assets/custom/images/colecciones/museos.png",
      href: "/communities/5e81a596-9011-4166-878f-82c7c066e512",
    },
    {
      title: "RedUNCI",
      img: "assets/custom/images/colecciones/redunci.png",
      href: "/communities/19ace49e-c442-4258-9a7d-60c26c2c4693"
    },
    {
      title: "Educación a Distancia y Tecnologías",
      img: "assets/custom/images/colecciones/direccion_general.png",
      href: "/collections/direccion_general"
    },
    {
      title: "Emergencia hídrica",
      img: "assets/custom/images/colecciones/emergencia.png",
      href: "/communities/273f7a90-9c00-4764-a9c6-6eafba041932",
    }
  ];

  unidadesAcademicas: ColeccionDestacada[] = [
    {
      title: "Bachillerato de Bellas Artes",
      img: "assets/custom/images/colecciones/transparencia.png",
      href: "/collections/BBA",
    },
    {
      title: "Facultad de Artes",
      img: "assets/custom/images/colecciones/transparencia.png",
      href: "/collections/FdA",
    },
    {
      title: "Facultad de Ciencias Astronómicas y Geofísicas",
      img: "assets/custom/images/colecciones/transparencia.png",
      href: "/collections/FacultadCienciasAstronómicasGeofísicas",
    },
    {
      title: "Facultad de Informática",
      img: "assets/custom/images/colecciones/transparencia.png",
      href: "/collections/FacultadInformática",
    },
    {
      title: "Red de Museos",
      img: "assets/custom/images/colecciones/museos.png",
      href: "/communities/5e81a596-9011-4166-878f-82c7c066e512",
    },
    {
      title: "RedUNCI",
      img: "assets/custom/images/colecciones/redunci.png",
      href: "/communities/19ace49e-c442-4258-9a7d-60c26c2c4693",
    },
    {
      title: "Dirección General de Educación a Distancia y Tecnologías",
      img: "assets/custom/images/colecciones/direccion_general.png",
      href: "/collections/direccion_general",
      description: "Educación a Distancia y Tecnologías"
    },
    {
      title: "Emergencia hídrica",
      img: "assets/custom/images/colecciones/emergencia.png",
      href: "/communities/273f7a90-9c00-4764-a9c6-6eafba041932",
    }
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
    this.academicUnits = this.appConfig.academicUnits;
  }

  comcolArray: SliderItem[] = [];

  ngOnInit(): void {
    super.ngOnInit();

    for (const comcol of this.appConfig.academicUnits){
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
            this.comcolArray.push(
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
            this.comcolArray.push(
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
  }
}
