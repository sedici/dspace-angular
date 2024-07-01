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
import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';



import {
  ADVANCED_WORKFLOW_ACTION_SELECT_COLLECTION,
  ADVANCED_WORKFLOW_TASK_OPTION_SELECT_COLLECTION
} from 'src/app/workflowitems-edit-page/advanced-workflow-action/sedici-advanced-workflow-select-collection/workflow-select-collection.component';
import { RequestService } from '../../../../core/data/request.service';
import { SearchService } from '../../../../core/shared/search/search.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { AdvancedClaimedTaskActionsAbstractComponent } from '../abstract/advanced-claimed-task-actions-abstract.component';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';


@Component({
  selector: 'ds-claimed-task-actions-select-collection',
  styleUrls: ['./claimed-task-actions-select-collection.component.scss'],
  templateUrl: './claimed-task-actions-select-collection.component.html',
  standalone: true,
  imports: [NgbTooltipModule, NgIf, AsyncPipe, TranslateModule],
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

}
