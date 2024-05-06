import { ADVANCED_WORKFLOW_ACTION_APPROVE_AND_SELECT, ADVANCED_WORKFLOW_TASK_OPTION_APPROVE_AND_SELECT } from './../../../../workflowitems-edit-page/advanced-workflow-action/sedici-advanced-approve-and-select/advanced-approve-and-select.component';
import {
  Component,
  Injector,
  Input,
} from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras, } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  of,
} from 'rxjs';


import { RemoteData } from '../../../../core/data/remote-data';
import { RequestService } from '../../../../core/data/request.service';
import { DSpaceObject } from '../../../../core/shared/dspace-object.model';
import { SearchService } from '../../../../core/shared/search/search.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { ClaimedApprovedTaskSearchResult } from '../../../object-collection/shared/claimed-approved-task-search-result.model';
import { AdvancedClaimedTaskActionsAbstractComponent } from '../abstract/advanced-claimed-task-actions-abstract.component';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { getAdvancedWorkflowRoute } from 'src/app/workflowitems-edit-page/workflowitems-edit-page-routing-paths';
import { WorkflowItem } from 'src/app/core/submission/models/workflowitem.model';
import { Item } from 'src/app/core/shared/item.model';

@rendersWorkflowTaskOption(ADVANCED_WORKFLOW_TASK_OPTION_APPROVE_AND_SELECT)
@Component({
  selector: 'ds-claimed-task-actions-approve-and-select',
  styleUrls: ['./claimed-task-actions-approve-and-select.component.scss'],
  templateUrl: './claimed-task-actions-approve-and-select.component.html',
})
/**
 * Component for displaying and processing the approve action on a workflow task item
 */
export class ClaimedTaskActionsApproveAndSelectComponent extends AdvancedClaimedTaskActionsAbstractComponent {
  /**
   * This component represents the approve option
   */

  option = ADVANCED_WORKFLOW_TASK_OPTION_APPROVE_AND_SELECT;

  workflowType = ADVANCED_WORKFLOW_ACTION_APPROVE_AND_SELECT;

  constructor(protected injector: Injector,
              protected router: Router,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected searchService: SearchService,
              protected requestService: RequestService,
              protected route: ActivatedRoute,) {
    super(injector, router, notificationsService, translate, searchService, requestService, route);
  }


}
