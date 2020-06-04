import { Component } from '@angular/core';
import { rendersWorkflowTaskOption } from '../switcher/claimed-task-actions-decorator';
import { ClaimedTaskActionsAbstractComponent } from '../abstract/claimed-task-actions-abstract.component';
import { ClaimedTaskDataService } from '../../../../core/tasks/claimed-task-data.service';

export const WORKFLOW_SELECT_COLLECTION_APPROVE = 'submit_select_collection';
export const PARAM_COLLECTION_HANDLE = 'collection_handle';

@rendersWorkflowTaskOption(WORKFLOW_SELECT_COLLECTION_APPROVE)
@Component({
  selector: 'select-collection',
  templateUrl: './select-collection.component.html',
  styleUrls: ['./select-collection.component.css']
})

/**
 * Component for displaying and processing the select collection action on a workflow task item,
 * usually  as the last action before archive an item at repository.
 */
export class ClaimedTaskActionsSelectCollectionComponent extends ClaimedTaskActionsAbstractComponent {
  /**
   * This component represents the approve option
   */
  option = WORKFLOW_SELECT_COLLECTION_APPROVE;

  constructor(protected claimedTaskService: ClaimedTaskDataService) {
    super(claimedTaskService);
  }

  /**
   * Create the request body for rejecting a workflow task
   * Includes the reason from the form
   */
  createbody(): any {
    const TEST_COLLECTION_HANDLE = "10915/27";
    const collection_handle = TEST_COLLECTION_HANDLE;
    return Object.assign(super.createbody(), { collection_handle });
  }
}
