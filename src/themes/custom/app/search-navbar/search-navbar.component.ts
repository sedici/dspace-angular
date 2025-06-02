import { Component, Input } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SearchService } from 'src/app/core/shared/search/search.service';
import { SearchNavbarComponent as BaseComponent } from '../../../../app/search-navbar/search-navbar.component';
import { BrowserOnlyPipe } from '../../../../app/shared/utils/browser-only.pipe';
import { ClickOutsideDirective } from '../../../../app/shared/utils/click-outside.directive';

@Component({
  selector: 'ds-themed-search-navbar',
  styleUrls: ['./search-navbar.component.scss'],
  // styleUrls: ['../../../../app/search-navbar/search-navbar.component.scss'],
  templateUrl: './search-navbar.component.html',
  // templateUrl: '../../../../app/search-navbar/search-navbar.component.html',
  standalone: true,
  imports: [ClickOutsideDirective, FormsModule, ReactiveFormsModule, TranslateModule, BrowserOnlyPipe],
})
export class SearchNavbarComponent extends BaseComponent {
  @Input() alwaysExpanded = false;

  private localRouter: Router;
  private localSearchService: SearchService;

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

    const currentQuery = this.activatedRoute.snapshot.queryParams?.query;
    if (currentQuery) {
      this.searchForm.patchValue({
        query: currentQuery
      });
    }
  }

  /**
   * Sobrescribe el método onSubmit del componente base
   * para mantener los parámetros de búsqueda existentes
   */
  onSubmit(data: any) {
    this.collapse();
    
    // Obtiene los parámetros actuales de la URL
    const currentParams = { ...this.activatedRoute.snapshot.queryParams };
    
    // Combina los parámetros actuales con el nuevo término de búsqueda
    const queryParams = {
      ...currentParams,
      query: data.query
    };
    
    // Si la query está vacía, eliminarla de los parámetros
    if (!data.query) {
      delete queryParams.query;
    }
    
    const linkToNavigateTo = [this.localSearchService.getSearchLink().replace('/', '')];

    this.localRouter.navigate(linkToNavigateTo, {
      queryParams: queryParams,
    });
  }
}
