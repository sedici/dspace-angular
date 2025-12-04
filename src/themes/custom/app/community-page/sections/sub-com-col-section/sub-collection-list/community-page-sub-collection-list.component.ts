import { Component } from '@angular/core';
import { CommunityPageSubCollectionListComponent as BaseComponent } from '../../../../../../../app/community-page/sections/sub-com-col-section/sub-collection-list/community-page-sub-collection-list.component';

@Component({
  selector: 'ds-community-page-sub-collection-list',
  // styleUrls: ['./community-page-sub-collection-list.component.scss'],
  template: '', // Empty template to hide the list
  standalone: true,
  imports: [],
})
export class CommunityPageSubCollectionListComponent extends BaseComponent {
  // Override ngOnInit to prevent data loading
  ngOnInit(): void {
    // Do nothing
  }
}
