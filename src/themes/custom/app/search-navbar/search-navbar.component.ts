import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SearchService } from 'src/app/core/shared/search/search.service';
import { SearchNavbarComponent as BaseComponent } from '../../../../app/search-navbar/search-navbar.component';

import { ClickOutsideDirective } from '../../../../app/shared/utils/click-outside.directive';

@Component({
  selector: 'ds-themed-search-navbar',
  styleUrls: ['./search-navbar.component.scss'],
  // styleUrls: ['../../../../app/search-navbar/search-navbar.component.scss'],
  templateUrl: './search-navbar.component.html',
  // templateUrl: '../../../../app/search-navbar/search-navbar.component.html',
  imports: [

    ClickOutsideDirective,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class SearchNavbarComponent extends BaseComponent {
  @Input() alwaysExpanded = false;

  private localRouter: Router;
  private localSearchService: SearchService;
  private destroy$ = new Subject<void>();

  constructor(
    formBuilder: UntypedFormBuilder, 
    router: Router, 
    searchService: SearchService,
    private activatedRoute: ActivatedRoute
  ) {
    super(formBuilder, router, searchService);
    this.localRouter = router;
    this.localSearchService = searchService;
  }

  ngOnInit() {
    if (this.alwaysExpanded) {
      this.searchExpanded = true;
      this.isExpanded = 'expanded';
    }

    this.activatedRoute.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const currentQuery = params?.query || '';
      
      if (this.searchForm.get('query')?.value !== currentQuery) {
        this.searchForm.patchValue({
          query: currentQuery
        }, { emitEvent: false });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sobrescribe el método onSubmit del componente base
   * para mantener los parámetros de búsqueda existentes
   */
  onSubmit(data: any) {
    this.collapse();
    
    const currentParams = { ...this.activatedRoute.snapshot.queryParams };

    // Para que la búsqueda vaya siempre al /search y no se quede dentro del workspace
    delete currentParams.configuration;
    
    const queryParams = {
      ...currentParams,
      query: data.query,
      'spc.page': 1
    };

    const linkToNavigateTo = [this.localSearchService.getSearchLink().replace('/', '')];

    if (!data.query) {
      delete queryParams.query;
      
      this.localRouter.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.localRouter.navigate(linkToNavigateTo, {
          queryParams: queryParams,
        });
      });
      return;
    }
    
    this.localRouter.navigate(linkToNavigateTo, {
      queryParams: queryParams,
    });
  }
}
