import {
  AsyncPipe,
  NgIf,
  NgFor,
} from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { HostWindowService, WidthCategory } from 'src/app/shared/host-window.service';

import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';
import { SearchFormComponent } from '../../shared/search-form/search-form.component';
import { ThemedSearchNavbarComponent } from 'src/app/search-navbar/themed-search-navbar.component';

import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

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
  imports:[
    AsyncPipe, NgIf, NgFor, SearchFormComponent, ThemedSearchNavbarComponent, RouterLink,
  ],
  standalone: true,
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent extends BaseComponent {
  public isMobile$: Observable<boolean>;

  maxMobileWidth = WidthCategory.SM;

  constructor(
    protected windowService: HostWindowService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {
    super()
  }

  ngOnInit(): void {
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
    this.loadItemCount();
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
      title: "Autores",
      img: "assets/custom/images/autores.png",
      href: "/browse/author",
      description: "Profesores, investigadores, estudiantes u otros colaboradores",
    } as CardItem,{
      title: "Publicaciones",
      img: "assets/custom/images/publicaciones.png",
      href: "/search",
      description: "Revistas, libras, informes tecincos, trabajos de conferencias, tesis ..."
    } as CardItem,{
      title: "Unidades Academicas",
      img: "assets/custom/images/unidades_academicas.png",
      href: "/handle/10915/1",
      description: "Facultades, colegios, laboratorios, institutos, centros ..."
    } as CardItem
  ];
}

