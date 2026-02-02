import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { HostWindowService, WidthCategory } from 'src/app/shared/host-window.service';
import { TranslateModule } from '@ngx-translate/core';

import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';
import { SearchFormComponent } from '../../shared/search-form/search-form.component';
import { ThemedSearchNavbarComponent } from 'src/app/search-navbar/themed-search-navbar.component';
import { ThemedNavbarComponent } from 'src/app/navbar/themed-navbar.component';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { MenuService } from 'src/app/shared/menu/menu.service';
import { MenuID } from 'src/app/shared/menu/menu-id.model';

export interface CardItem {
  title: string;
  img: string;
  description: string;
  href: string;
}
@Component({
  selector: 'ds-themed-home-news',
  styleUrls: ['./home-news.component.scss'],
  //styleUrls: ['../../../../../app/home-page/home-news/home-news.component.scss'],
  templateUrl: './home-news.component.html',
  //templateUrl: '../../../../../app/home-page/home-news/home-news.component.html',
  imports: [
    AsyncPipe,
    SearchFormComponent,
    ThemedSearchNavbarComponent,
    RouterLink,
    TranslateModule,
    ThemedNavbarComponent,
],
  standalone: true,
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent extends BaseComponent {
  public isMobile$: Observable<boolean>;
  public isNavBarCollapsed$: Observable<boolean>;

  menuID = MenuID.PUBLIC;

  maxMobileWidth = WidthCategory.SM;

  constructor(
    protected windowService: HostWindowService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private menuService: MenuService,
  ) {
    super()
  }

  ngOnInit(): void {
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
    this.isNavBarCollapsed$ = this.menuService.isMenuCollapsed(this.menuID);
    this.loadItemCount();
  }

  public toggleNavbar(): void {
    this.menuService.toggleMenu(this.menuID);
  }

  totalItems = '';
  
  loadItemCount(): void {
    const searchUrl = `${environment.rest.baseUrl}/api/discover/search/objects?size=1&page=0`;
    
    this.http.get(searchUrl).subscribe((response: any) => {
      if (response._embedded.searchResult.page.totalElements !== undefined) {
        this.totalItems = response._embedded.searchResult.page.totalElements;
        this.cdr.detectChanges();
      }
    }, (error) => {
      console.error('Error al cargar el conteo de items:', error);
    });
  }

  cardItems:Array<CardItem> = [
    {
      title: "journals",
      img: "assets/custom/images/Publicaciones.svg",
      href: "/handle/10915/51",
    } as CardItem,{
      title: "events",
      img: "assets/custom/images/Autores.svg",
      href: "/handle/10915/1038",
    } as CardItem,
    {
      title: "books",
      img: "assets/custom/images/UAs.svg",
      href: "/search?spc.page=1&f.itemtype=Libro,equals&spc.sf=dc.date.accessioned&spc.sd=DESC",
    } as CardItem,
    {
      title: "data",
      img: "assets/custom/images/Autores.svg",
      href: "/search?spc.page=1&f.itemtype=Conjunto%20de%20datos,equals&spc.sf=dc.date.accessioned&spc.sd=DESC",
    } as CardItem,
  ];

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}

