import {
  AsyncPipe,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { pushInOut } from '../../../../../app/shared/animations/push';
import { SearchComponent as BaseComponent } from '../../../../../app/shared/search/search.component';
import { SearchLabelsComponent } from '../../../../../app/shared/search/search-labels/search-labels.component';
import { ThemedSearchResultsComponent } from '../../../../../app/shared/search/search-results/themed-search-results.component';
import { ThemedSearchSidebarComponent } from '../../../../../app/shared/search/search-sidebar/themed-search-sidebar.component';
import { ThemedSearchFormComponent } from '../../../../../app/shared/search-form/themed-search-form.component';
import { PageWithSidebarComponent } from '../../../../../app/shared/sidebar/page-with-sidebar.component';
import { ViewModeSwitchComponent } from '../../../../../app/shared/view-mode-switch/view-mode-switch.component';
import { SidebarMode } from '../../../../../app/shared/sidebar/sidebar.actions';
import { PaginationComponent } from 'src/app/shared/pagination/pagination.component';
import { SortDirection } from 'src/app/core/cache/models/sort-options.model';

@Component({
  selector: 'ds-themed-search',
  styleUrls: ['./search.component.scss'],
  // styleUrls: ['../../../../../app/shared/search/search.component.scss'],
  templateUrl: './search.component.html',
  // templateUrl: '../../../../../app/shared/search/search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [pushInOut],
  standalone: true,
  imports: [
    AsyncPipe,
    NgTemplateOutlet,
    PageWithSidebarComponent,
    SearchLabelsComponent,
    ThemedSearchFormComponent,
    ThemedSearchResultsComponent,
    ThemedSearchSidebarComponent,
    TranslateModule,
    ViewModeSwitchComponent,
    PaginationComponent,
  ],
})
export class SearchComponent extends BaseComponent {
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() prev = new EventEmitter<boolean>();
  @Output() next = new EventEmitter<boolean>();
  @Output() pageSizeChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() sortDirectionChange: EventEmitter<SortDirection> = new EventEmitter<SortDirection>();
  @Output() sortFieldChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() paginationChange: EventEmitter<any> = new EventEmitter<any>();

  onPageChange(event) {
    this.pageChange.emit(event);
  }

  onPageSizeChange(event) {
    this.pageSizeChange.emit(event);
  }

  onSortDirectionChange(event) {
    this.sortDirectionChange.emit(event);
  }

  onSortFieldChange(event) {
    this.sortFieldChange.emit(event);
  }

  onPaginationChange(event) {
    this.paginationChange.emit(event);
  }

  goPrev() {
    this.prev.emit(true);
  }

  goNext() {
    this.next.emit(true);
  }

  public openSortSidebar(): void {
    this.sidebarService.expandWithMode(SidebarMode.SORT);
  }

  public openFiltersSidebar(): void {
    this.sidebarService.expandWithMode(SidebarMode.FILTERS);
  }
}
