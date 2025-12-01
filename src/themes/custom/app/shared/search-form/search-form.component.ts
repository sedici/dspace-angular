import { NgClass, AsyncPipe } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SearchFormComponent as BaseComponent } from '../../../../../app/shared/search-form/search-form.component';
import { BrowserOnlyPipe } from '../../../../../app/shared/utils/browser-only.pipe';
import { SearchService } from '../../../../../app/core/shared/search/search.service';
import { SearchFilterService } from '../../../../../app/core/shared/search/search-filter.service';
import { PaginationService } from '../../../../../app/core/pagination/pagination.service';
import { SearchConfigurationService } from '../../../../../app/core/shared/search/search-configuration.service';
import { DSpaceObjectDataService } from '../../../../../app/core/data/dspace-object-data.service';
import { DSONameService } from '../../../../../app/core/breadcrumbs/dso-name.service';

@Component({
  selector: 'ds-themed-search-form',
  styleUrls: ['./search-form.component.scss'],
  templateUrl: './search-form.component.html',
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

  @Input() variant: 'home' | 'community' | 'navbar' = 'home';

  public isHomePage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private routerSubscription: Subscription;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected searchService: SearchService,
    protected searchFilterService: SearchFilterService,
    protected paginationService: PaginationService,
    protected searchConfig: SearchConfigurationService,
    protected modalService: NgbModal,
    protected dsoService: DSpaceObjectDataService,
    public dsoNameService: DSONameService,
  ) {
    super(router, searchService, searchFilterService, paginationService, searchConfig, modalService, dsoService, dsoNameService);
  }

  ngOnInit(): void {
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

    this.route.queryParams.subscribe(params => {
      if (params.query && currentUrl.includes('/search')) {
        this.query = params.query; // Asigna el valor de la URL a la variable que usa el [(ngModel)]
      } else {
        this.query = '';
      }
    });
  }

  private isHomeUrl(url: string): boolean {
    return url === '/' ||
      url === '/home' ||
      url.startsWith('/home?');
  }

  /**
   * Sobrescribe el método updateSearch para excluir el parámetro 'configuration'
   * @param data Updated parameters
   */
  override updateSearch(data: any) {
    const goToFirstPage = { 'spc.page': 1 };

    // Obtener los query params actuales y excluir 'configuration'
    const currentParams = { ...this.route.snapshot.queryParams };
    const { configuration, ...paramsWithoutConfig } = currentParams;

    const queryParams = Object.assign(
      {},
      paramsWithoutConfig, // Usar los params sin 'configuration'
      goToFirstPage,
      data,
    );

    // Si hay scope y debe ocultarse en la URL, eliminarlo
    if (data?.scope && this.hideScopeInUrl) {
      delete queryParams.scope;
    }

    void this.router.navigate(this.getSearchLinkParts(), {
      queryParams: queryParams,
      queryParamsHandling: '', // No hacer merge para evitar mantener 'configuration'
    });
  }
}