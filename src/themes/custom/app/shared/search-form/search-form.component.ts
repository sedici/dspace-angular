import { NgClass, AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SearchFormComponent as BaseComponent } from '../../../../../app/shared/search-form/search-form.component';
import { BrowserOnlyPipe } from '../../../../../app/shared/utils/browser-only.pipe';

@Component({
  selector: 'ds-themed-search-form',
  styleUrls: ['./search-form.component.scss'],
  // styleUrls: ['../../../../../app/shared/search-form/search-form.component.scss'],
  templateUrl: './search-form.component.html',
  // templateUrl: '../../../../../app/shared/search-form/search-form.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    BrowserOnlyPipe,
    FormsModule,
    NgbTooltipModule,
    TranslateModule,
    NgClass,
    RouterLink,
  ],
})
export class SearchFormComponent extends BaseComponent implements OnInit {

  public isHomePage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private routerSubscription: Subscription;

  ngOnInit(): void {
        // Verifica la URL inicial al cargar
    const currentUrl = this.router.url;
    this.isHomePage$.next(this.isHomeUrl(currentUrl));
    
    // Detecta cambios en la URL mientras navegas
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => {
        const isHome = this.isHomeUrl(event.urlAfterRedirects);
        return isHome;
      })
    ).subscribe(isHome => {
      this.isHomePage$.next(isHome);
    });
  }

  // Método helper para determinar si una URL es la página de inicio
  private isHomeUrl(url: string): boolean {
    return url === '/' || 
           url === '/home' || 
           url.startsWith('/home?');
  }
}
