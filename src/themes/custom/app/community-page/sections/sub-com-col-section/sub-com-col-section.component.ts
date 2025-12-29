import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubComColSectionComponent as BaseComponent } from '../../../../../../../app/community-page/sections/sub-com-col-section/sub-com-col-section.component';
import { ThemedCollectionPageSubCollectionListComponent } from '../../../../../../../app/community-page/sections/sub-com-col-section/sub-collection-list/themed-community-page-sub-collection-list.component';
import { ThemedCommunityPageSubCommunityListComponent } from './sub-community-list/themed-community-page-sub-community-list.component';
import { RemoteData } from '../../../../../../../app/core/data/remote-data';
import { Community } from '../../../../../../../app/core/shared/community.model';
import { PaginatedList } from '../../../../../../../app/core/data/paginated-list.model';

@Component({
  selector: 'ds-sub-com-col-section',
  // templateUrl: './sub-com-col-section.component.html',
  templateUrl: './sub-com-col-section.component.html',
  styleUrls: ['../../../../../../../app/community-page/sections/sub-com-col-section/sub-com-col-section.component.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    ThemedCollectionPageSubCollectionListComponent,
    ThemedCommunityPageSubCommunityListComponent,
  ],
})
export class SubComColSectionComponent extends BaseComponent implements OnInit {
  
  subCommunities$: Observable<RemoteData<PaginatedList<Community>>>;

  constructor(protected route: ActivatedRoute) {
    super(route);
  }

  ngOnInit(): void {
    super.ngOnInit();
    // Retrieve preloaded sub-communities from the route data
    this.subCommunities$ = this.route.data.pipe(
      map((data: Data) => data.subCommunities)
    );
  }
}
