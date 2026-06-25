import { AsyncPipe, NgClass } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';



import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';

import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuService } from 'src/app/shared/menu/menu.service';
import { HostWindowService } from 'src/app/shared/host-window.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { SearchFormComponent } from '../shared/search-form/search-form.component'; 

@Component({
  selector: 'ds-themed-header',
  styleUrls: ['header.component.scss'],
  // styleUrls: ['../../../../app/header/header.component.scss'],
  templateUrl: 'header.component.html',
  // templateUrl: '../../../../app/header/header.component.html',
  imports: [RouterLink, SearchFormComponent, NgbDropdownModule, ThemedSearchNavbarComponent, ThemedNavbarComponent, TranslateModule, AsyncPipe, NgClass, NgbModule],
})
export class HeaderComponent extends BaseComponent implements OnInit {
  public isNavBarCollapsed$: Observable<boolean>;
  public isHomePage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isSubmissionPage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private routerSubscription: Subscription;

  constructor(protected menuService: MenuService,
    protected windowService: HostWindowService, 
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef) {
    super(menuService, windowService);
    this.isHomePage$ = new BehaviorSubject<boolean>(this.isHomeUrl(this.router.url));
  }

  ngOnInit() {
    this.loadItemCount();
    super.ngOnInit();
    this.isNavBarCollapsed$ = this.menuService.isMenuCollapsed(this.menuID);
    
    // Verifica la URL inicial al cargar
    const currentUrl = this.router.url;
    this.isHomePage$.next(this.isHomeUrl(currentUrl));
    this.isSubmissionPage$.next(this.isSubmissionUrl(currentUrl));
    
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => {
        const isHome = this.isHomeUrl(event.urlAfterRedirects);
        const isSubmission = this.isSubmissionUrl(event.urlAfterRedirects);
        return { isHome, isSubmission };
      })
    ).subscribe(({ isHome, isSubmission }) => {
      this.isHomePage$.next(isHome);
      this.isSubmissionPage$.next(isSubmission);
    });
  }

  totalItems = '';
    
  private loadItemCount(): void {
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
  
  
  ngOnDestroy() {
    // Importante: limpiar la suscripción para evitar pérdidas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  // Método helper para determinar si una URL es la página de inicio
  private isHomeUrl(url: string): boolean {
    return url === '/' || 
           url === '/home' || 
           url.startsWith('/home?');
  }

  private isSubmissionUrl(url: string): boolean {
    return url.startsWith('/workspaceitems') && url.endsWith('/edit');
  }
}
