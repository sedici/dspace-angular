import { Component } from '@angular/core';
import { CommunityPageSubCollectionListComponent as BaseComponent } from '../../../../../../../app/community-page/sections/sub-com-col-section/sub-collection-list/community-page-sub-collection-list.component';

@Component({
  selector: 'ds-themed-community-page-sub-collection-list',
  template: '', // SEDICI: El siguiente código fue comentado para ocultar la lista de colecciones
  // debido a la modificación de la visualización de la colección en modo de tree
  // styleUrls: ['./community-page-sub-collection-list.component.scss'],
  // styleUrls: ['../../../../../../../app/community-page/sections/sub-com-col-section/sub-collection-list/community-page-sub-collection-list.component.scss'],
  //templateUrl: './community-page-sub-collection-list.component.html',
  // templateUrl: '../../../../../../../app/community-page/sections/sub-com-col-section/sub-collection-list/community-page-sub-collection-list.component.html',
  // imports: [
  //   AsyncPipe,
  //   ErrorComponent,
  //   ObjectCollectionComponent,
  //   ThemedLoadingComponent,
  //   TranslateModule,
  //   VarDirective,
  // ],
  standalone: true,
  imports: [],
})
export class CommunityPageSubCollectionListComponent extends BaseComponent {
  // Override ngOnInit to prevent data loading
  ngOnInit(): void {
    // Do nothing
  }
}
