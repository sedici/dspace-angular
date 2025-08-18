import { AsyncPipe, NgClass } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ThemedLangSwitchComponent } from 'src/app/shared/lang-switch/themed-lang-switch.component';

import { ContextHelpToggleComponent } from '../../../../app/header/context-help-toggle/context-help-toggle.component';
import { HeaderComponent as BaseComponent } from '../../../../app/header/header.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';
import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuService } from 'src/app/shared/menu/menu.service';
import { HostWindowService } from 'src/app/shared/host-window.service';

@Component({
  selector: 'ds-themed-header',
  styleUrls: ['header.component.scss'],
  // styleUrls: ['../../../../app/header/header.component.scss'],
  templateUrl: 'header.component.html',
  // templateUrl: '../../../../app/header/header.component.html',
  standalone: true,
  imports: [RouterLink, ThemedLangSwitchComponent, NgbDropdownModule, ThemedSearchNavbarComponent, ThemedNavbarComponent, ContextHelpToggleComponent, ThemedAuthNavMenuComponent, ImpersonateNavbarComponent, TranslateModule, AsyncPipe, NgClass, NgbModule],
})
export class HeaderComponent extends BaseComponent implements OnInit {
  public isNavBarCollapsed$: Observable<boolean>;
  public isHomePage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private routerSubscription: Subscription;

  constructor(protected menuService: MenuService, protected windowService: HostWindowService, private router: Router) {
    super(menuService, windowService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.isNavBarCollapsed$ = this.menuService.isMenuCollapsed(this.menuID);
    
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
}
