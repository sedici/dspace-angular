import {
  Observable,
  of,
 } from 'rxjs';
import {
  Component,
  Injector,
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


import {
  ADVANCED_WORKFLOW_ACTION_SELECT_COLLECTION,
  ADVANCED_WORKFLOW_TASK_OPTION_SELECT_COLLECTION
} from 'src/app/workflowitems-edit-page/advanced-workflow-action/sedici-advanced-workflow-select-collection/workflow-select-collection.component';
import { RequestService } from '../../../../core/data/request.service';
import { SearchService } from '../../../../core/shared/search/search.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { AdvancedClaimedTaskActionsAbstractComponent } from '../abstract/advanced-claimed-task-actions-abstract.component';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';


@rendersWorkflowTaskOption(ADVANCED_WORKFLOW_TASK_OPTION_SELECT_COLLECTION)
@Component({
  selector: 'ds-claimed-task-actions-select-collection',
  styleUrls: ['./claimed-task-actions-select-collection.component.scss'],
  templateUrl: './claimed-task-actions-select-collection.component.html',
})
/**
 * Component for displaying the edit metadata action on a workflow task item
 */
export class ClaimedTaskActionsSelectCollectionComponent extends AdvancedClaimedTaskActionsAbstractComponent {

  workflowType = ADVANCED_WORKFLOW_ACTION_SELECT_COLLECTION;
  /**
   * This component represents the edit metadata option
   */
  option = ADVANCED_WORKFLOW_TASK_OPTION_SELECT_COLLECTION;

  constructor(protected injector: Injector,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected searchService: SearchService,
              protected requestService: RequestService,
              protected route: ActivatedRoute,
              ) {
    super(injector, router, notificationsService, translate, searchService, requestService, route);
  }

  // ngOnInit(): void {
  //   this.collectionDataService.findByHref(`${environment.rest.baseUrl}/api/core/collections/${this.workflowitem.sections.collection}`).subscribe(collection => {
  //     this.originalCollection = collection?.payload;
  //     this.selectedCollection = this.originalCollection;
  //     this.selectedCollectionName = this.selectedCollection.name;
  //   });
  //  }

}
