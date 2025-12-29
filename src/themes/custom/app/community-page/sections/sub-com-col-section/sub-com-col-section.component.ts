import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { AsyncPipe, isPlatformServer } from '@angular/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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

  constructor(
    protected route: ActivatedRoute,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {
    super(route);
  }

  ngOnInit(): void {
    super.ngOnInit();
    const isServer = isPlatformServer(this.platformId);
    console.log(`[${isServer ? 'SERVER' : 'CLIENT'}] SubComColSectionComponent: Initializing. Checking route data...`);

    // Retrieve preloaded sub-communities from the route data
    this.subCommunities$ = this.route.data.pipe(
      map((data: Data) => {
        const subCommunities = data.subCommunities;
        console.log(`[${isServer ? 'SERVER' : 'CLIENT'}] SubComColSectionComponent: Route data received. SubCommunities present?`, !!subCommunities);
        if (subCommunities?.payload?.page) {
             console.log(`[${isServer ? 'SERVER' : 'CLIENT'}] SubComColSectionComponent: SubCommunities count:`, subCommunities.payload.page.length);
        }
        return subCommunities;
      })
    );
  }
}
