import { Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Observable,
  of,
  Subscription,
} from 'rxjs';
import { finalize, map, switchMap, take } from 'rxjs/operators';
import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { TranslateModule } from '@ngx-translate/core';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AsyncPipe, isPlatformServer } from '@angular/common';

import { Community } from '../../../../../../../app/core/shared/community.model';
import { Collection } from '../../../../../../../app/core/shared/collection.model';
import { CommunityDataService } from '../../../../../../../app/core/data/community-data.service';
import { CollectionDataService } from '../../../../../../../app/core/data/collection-data.service';
import { FindListOptions } from '../../../../../../../app/core/data/find-list-options.model';
import {
  PaginatedList,
  buildPaginatedList,
} from '../../../../../../../app/core/data/paginated-list.model';
import { RemoteData } from '../../../../../../../app/core/data/remote-data';
import {
  hasValue,
  isNotEmpty,
  isEmpty,
} from '../../../../../../../app/shared/empty.util';
import { DSONameService } from '../../../../../../../app/core/breadcrumbs/dso-name.service';
import { FlatNode } from '../../../../../../../app/community-list-page/flat-node.model';
import {
  CommunityListService,
  toFlatNode,
  showMoreFlatNode,
  combineAndFlatten,
} from '../../../../../../../app/community-list-page/community-list-service';
import { ThemedLoadingComponent } from '../../../../../../../app/shared/loading/themed-loading.component';
import { TruncatableComponent } from '../../../../../../../app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from '../../../../../../../app/shared/truncatable/truncatable-part/truncatable-part.component';
import {
  SortDirection,
  SortOptions,
} from '../../../../../../../app/core/cache/models/sort-options.model';
import { getFirstCompletedRemoteData } from '../../../../../../../app/core/shared/operators';
import { followLink } from '../../../../../../../app/shared/utils/follow-link-config.model';
import { v4 as uuidv4 } from 'uuid';

export class SubComColDatasource implements DataSource<FlatNode> {
  private communityList$ = new BehaviorSubject<FlatNode[]>([]);
  public loading$ = new BehaviorSubject<boolean>(false);
  private subLoadCommunities: Subscription;

  constructor(
    private loadFn: (
      findOptions: FindListOptions,
      expandedNodes: FlatNode[]
    ) => Observable<FlatNode[]>
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<FlatNode[]> {
    return this.communityList$.asObservable();
  }

  /**
   * Set data directly without making HTTP requests.
   * Used for pre-loaded data from SSR to avoid hydration mismatch.
   */
  setData(data: FlatNode[]): void {
    console.log('SubComColDatasource.setData called with', data?.length, 'nodes');
    this.communityList$.next(data);
  }

  loadCommunities(findOptions: FindListOptions, expandedNodes: FlatNode[]) {
    console.log('SubComColDatasource.loadCommunities called');
    this.loading$.next(true);
    if (hasValue(this.subLoadCommunities)) {
      this.subLoadCommunities.unsubscribe();
    }
    this.subLoadCommunities = this.loadFn(findOptions, expandedNodes)
      .pipe(finalize(() => this.loading$.next(false)))
      .subscribe((flatNodes: FlatNode[]) => {
        this.communityList$.next(flatNodes);
      });
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.communityList$.complete();
    this.loading$.complete();
  }
}

@Component({
  selector: 'ds-themed-community-page-sub-community-list',
  styleUrls: ['./community-page-sub-community-list.component.scss'],
  // styleUrls: ['../../../../../../../app/community-page/sections/sub-com-col-section/sub-community-list/community-page-sub-community-list.component.scss'],
  templateUrl: './community-page-sub-community-list.component.html',
  // templateUrl: '../../../../../../../app/community-page/sections/sub-com-col-section/sub-community-list/community-page-sub-community-list.component.html',
  standalone: true,
  imports: [
    CdkTreeModule,
    RouterLink,
    ThemedLoadingComponent,
    TranslateModule,
    TruncatableComponent,
    TruncatablePartComponent,
    AsyncPipe,
  ],
})
export class CommunityPageSubCommunityListComponent
  implements OnInit, OnDestroy
{
  @Input() community: Community;
  @Input() pageSize: number = 5; // Default page size
  /**
   * Pre-loaded data from SSR to avoid hydration mismatch and flickering.
   * If provided, the component will use this data instead of making HTTP requests.
   */
  @Input() preloadedData?: FlatNode[];

  expandedNodes: FlatNode[] = [];
  loadingNode: FlatNode;

  subCommunityPage: number = 1;
  collectionPage: number = 1;

  treeControl = new FlatTreeControl<FlatNode>(
    (node: FlatNode) => node.level,
    (node: FlatNode) => true
  );

  dataSource: SubComColDatasource;
  paginationConfig: FindListOptions;
  trackBy = (index, node: FlatNode) => node.id;

  constructor(
    private communityListService: CommunityListService,
    private communityDataService: CommunityDataService,
    private collectionDataService: CollectionDataService,
    public dsoNameService: DSONameService,
    @Inject(PLATFORM_ID) protected platformId: Object
  ) {
    this.paginationConfig = new FindListOptions();
    this.paginationConfig.currentPage = 1;
    this.paginationConfig.sort = new SortOptions('dc.title', SortDirection.ASC);
  }

  ngOnInit(): void {
    const isServer = isPlatformServer(this.platformId);
    this.paginationConfig.elementsPerPage = +this.pageSize;
    this.dataSource = new SubComColDatasource(
      this.loadSubCommunitiesAndCollections.bind(this)
    );
    // If preloaded data exists (from SSR), use it directly to avoid flicker
    if (this.preloadedData && this.preloadedData.length > 0) {
      console.log(`[${isServer ? 'SERVER' : 'CLIENT'}] CommunityPageSubCommunityListComponent: using preloadedData`);
      this.dataSource.setData(this.preloadedData);
    } else {
      console.log(`[${isServer ? 'SERVER' : 'CLIENT'}] CommunityPageSubCommunityListComponent: no preloadedData, loading manually`);
      this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadSubCommunitiesAndCollections(
    findOptions: FindListOptions,
    expandedNodes: FlatNode[]
  ): Observable<FlatNode[]> {
    // Load Sub-communities
    const subComs$ = this.loadSubCommunities(findOptions, expandedNodes);

    // Load Collections
    const cols$ = this.loadCollections(findOptions, expandedNodes);

    return observableCombineLatest([subComs$, cols$]).pipe(
      map(([subComs, cols]) => [...subComs, ...cols])
    );
  }

  loadSubCommunities(
    findOptions: FindListOptions,
    expandedNodes: FlatNode[]
  ): Observable<FlatNode[]> {
    const currentPage = this.subCommunityPage;
    const subCommunities = [];
    for (let i = 1; i <= currentPage; i++) {
      const pagination: FindListOptions = Object.assign({}, findOptions, {
        currentPage: i,
      });
      subCommunities.push(
        this.communityDataService
          .findByParent(
            this.community.uuid,
            {
              currentPage: pagination.currentPage,
              elementsPerPage: pagination.elementsPerPage,
              sort: {
                field: pagination.sort.field,
                direction: pagination.sort.direction,
              },
            },
            followLink('subcommunities', {
              findListOptions: { elementsPerPage: 1 },
            }),
            followLink('collections', {
              findListOptions: { elementsPerPage: 1 },
            })
          )
          .pipe(
            getFirstCompletedRemoteData(),
            map((rd) => rd.payload)
          )
      );
    }

    const subComs$ = observableCombineLatest([...subCommunities]).pipe(
      map((coms: PaginatedList<Community>[]) => {
        const newPages: Community[][] = coms.map(
          (unit: PaginatedList<Community>) => unit?.page || []
        );
        const newPage: Community[] = [].concat(...newPages);
        let newPageInfo =
          coms[0]?.pageInfo ||
          ({ currentPage: currentPage, totalPages: 0 } as any);
        if (coms && coms.length > 0 && coms[0]) {
          newPageInfo = Object.assign({}, coms[0].pageInfo, { currentPage });
        }
        return buildPaginatedList(newPageInfo, newPage);
      })
    );

    return subComs$.pipe(
      switchMap((topComs: PaginatedList<Community>) =>
        this.communityListService.transformListOfCommunities(
          topComs,
          0,
          null,
          expandedNodes
        )
      )
    );
  }

  loadCollections(
    findOptions: FindListOptions,
    expandedNodes: FlatNode[]
  ): Observable<FlatNode[]> {
    const currentPage = this.collectionPage;
    const collections = [];
    for (let i = 1; i <= currentPage; i++) {
      const pagination: FindListOptions = Object.assign({}, findOptions, {
        currentPage: i,
      });
      collections.push(
        this.collectionDataService
          .findByParent(this.community.uuid, {
            currentPage: pagination.currentPage,
            elementsPerPage: pagination.elementsPerPage,
            sort: {
              field: pagination.sort.field,
              direction: pagination.sort.direction,
            },
          })
          .pipe(
            getFirstCompletedRemoteData(),
            map((rd) => rd.payload)
          )
      );
    }

    return observableCombineLatest([...collections]).pipe(
      map((cols: PaginatedList<Collection>[]) => {
        const newPages: Collection[][] = cols.map(
          (unit: PaginatedList<Collection>) => unit?.page || []
        );
        const newPage: Collection[] = [].concat(...newPages);
        let newPageInfo =
          cols[0]?.pageInfo ||
          ({ currentPage: currentPage, totalPages: 0 } as any);
        if (cols && cols.length > 0 && cols[0]) {
          newPageInfo = Object.assign({}, cols[0].pageInfo, { currentPage });
        }
        return buildPaginatedList(newPageInfo, newPage);
      }),
      map((paginatedList: PaginatedList<Collection>) => {
        if (hasValue(paginatedList) && hasValue(paginatedList.page)) {
          let nodes = paginatedList.page.map((collection: Collection) =>
            toFlatNode(collection, of(false), 0, false, null)
          );
          if (paginatedList.currentPage < paginatedList.totalPages) {
            // Add show more node
            nodes = [
              ...nodes,
              showMoreFlatNode(`collection-root-${uuidv4()}`, 0, null),
            ];
          }
          return nodes;
        } else {
          return [];
        }
      })
    );
  }

  hasChild(_: number, node: FlatNode) {
    return node.isExpandable$;
  }

  isShowMore(_: number, node: FlatNode) {
    return node.isShowMoreNode;
  }

  toggleExpanded(node: FlatNode) {
    this.loadingNode = node;
    if (node.isExpanded) {
      this.expandedNodes = this.expandedNodes.filter(
        (node2) => node2.id !== node.id
      );
      node.isExpanded = false;
      this.dataSource.loadCommunities(
        this.paginationConfig,
        this.expandedNodes
      );
    } else {
      this.expandedNodes.push(node);
      node.isExpanded = true;
      if (isEmpty(node.currentCollectionPage)) {
        node.currentCollectionPage = 1;
      }
      if (isEmpty(node.currentCommunityPage)) {
        node.currentCommunityPage = 1;
      }
      this.dataSource.loadCommunities(
        this.paginationConfig,
        this.expandedNodes
      );
    }
  }

  getNextPage(node: FlatNode): void {
    this.loadingNode = node;
    if (node.parent != null) {
      if (node.id.startsWith('collection')) {
        const parentNodeInExpandedNodes = this.expandedNodes.find(
          (node2: FlatNode) => node.parent.id === node2.id
        );
        parentNodeInExpandedNodes.currentCollectionPage++;
      }
      if (node.id.startsWith('community')) {
        const parentNodeInExpandedNodes = this.expandedNodes.find(
          (node2: FlatNode) => node.parent.id === node2.id
        );
        parentNodeInExpandedNodes.currentCommunityPage++;
      }
    } else {
      if (node.id.startsWith('collection')) {
        this.collectionPage++;
      } else {
        this.subCommunityPage++;
      }
    }
    this.dataSource.loadCommunities(this.paginationConfig, this.expandedNodes);
  }
}
