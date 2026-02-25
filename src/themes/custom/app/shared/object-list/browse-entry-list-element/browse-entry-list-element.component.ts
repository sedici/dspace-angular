import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { BrowseEntry } from '../../../../../../app/core/shared/browse-entry.model';
import { Context } from '../../../../../../app/core/shared/context.model';
import { ViewMode } from '../../../../../../app/core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { BrowseEntryListElementComponent as BaseComponent } from '../../../../../../app/shared/object-list/browse-entry-list-element/browse-entry-list-element.component';
import { VALUE_LIST_BROWSE_DEFINITION } from '../../../../../../app/core/shared/value-list-browse-definition.resource-type';
import { DSONameService } from '../../../../../../app/core/breadcrumbs/dso-name.service';
import { PaginationService } from '../../../../../../app/core/pagination/pagination.service';
import { RouteService } from '../../../../../../app/core/services/route.service';
import { BBM_PAGINATION_ID } from 'src/app/browse-by/browse-by-metadata/browse-by-metadata.component';
import { map } from 'rxjs/operators';
@Component({
  selector: 'ds-browse-entry-list-element',
  styleUrls: ['./browse-entry-list-element.component.scss'],
  // styleUrls: ['../../../../../../app/shared/object-list/browse-entry-list-element/browse-entry-list-element.component.scss'],
  templateUrl: './browse-entry-list-element.component.html',
  //templateUrl: '../../../../../../app/shared/object-list/browse-entry-list-element/browse-entry-list-element.component.html',
  imports: [
    AsyncPipe,
    RouterLink,
  ],
})
@listableObjectComponent(BrowseEntry, ViewMode.ListElement, Context.Any, 'custom')
export class BrowseEntryListElementComponent extends BaseComponent {

  constructor(
    public dsoNameService: DSONameService,
    protected paginationService: PaginationService,
    protected routeService: RouteService,
  ) {
    super(dsoNameService, paginationService, routeService);
  }

  protected getQueryParams(): Observable<Params> {
    const pageParamName = this.paginationService.getPageParam(BBM_PAGINATION_ID);
    return this.routeService.getQueryParameterValue(pageParamName).pipe(
      map((currentPage) => {
        const queryParams = {};
        const key = 'f.author';
        queryParams[key] = `${this.object.value},equals`;
        if (this.object.authority) {
          queryParams['authority'] = this.object.authority;
        }
        queryParams['startsWith'] = undefined;
        queryParams[pageParamName] = null;
        queryParams[BBM_PAGINATION_ID + '.return'] = currentPage;
        return queryParams;
      }),
    );
  }
}
