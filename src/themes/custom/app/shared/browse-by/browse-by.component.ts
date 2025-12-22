import {
  AsyncPipe,
  CommonModule,
} from '@angular/common';
import {
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
} from 'rxjs';
import { filter, map, scan, take } from 'rxjs/operators';
import { PaginationService } from 'src/app/core/pagination/pagination.service';
import { RouteService } from 'src/app/core/services/route.service';
import { ErrorComponent } from 'src/app/shared/error/error.component';
import { hasValue } from 'src/app/shared/empty.util';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from 'src/app/shared/object-collection/object-collection.component';
import { ThemedResultsBackButtonComponent } from 'src/app/shared/results-back-button/themed-results-back-button.component';
import { VarDirective } from 'src/app/shared/utils/var.directive';

import {
  fadeIn,
  fadeInOut,
} from '../../../../../app/shared/animations/fade';
import { BrowseByComponent as BaseComponent } from '../../../../../app/shared/browse-by/browse-by.component';
import { StartsWithLoaderComponent } from '../../../../../app/shared/starts-with/starts-with-loader.component';

@Component({
  selector: 'ds-themed-browse-by',
  styleUrls: ['../../../../../app/shared/browse-by/browse-by.component.scss'],
  templateUrl: './browse-by.component.html',
  animations: [
    fadeIn,
    fadeInOut,
  ],
  imports: [
    AsyncPipe,
    ErrorComponent,
    ObjectCollectionComponent,
    StartsWithLoaderComponent,
    ThemedLoadingComponent,
    ThemedResultsBackButtonComponent,
    TranslateModule,
    VarDirective,
  ],
})
export class BrowseByComponent extends BaseComponent implements OnInit {

  hasSearched$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _routeService: RouteService;

  constructor(
    injector: Injector,
    paginationService: PaginationService,
    translateService: TranslateService,
    routeService: RouteService,
  ) {
    super(injector, paginationService, translateService, routeService);
    this._routeService = routeService;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._routeService.getQueryParamMap().pipe(
      map(params => params.keys.length > 0),
    ).subscribe((hasAnyQueryParam: boolean) => {
      this.hasSearched$.next(hasAnyQueryParam);
    });
  }
}