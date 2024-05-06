import { Collection } from '../../../core/shared/collection.model';
import { Location } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable , of} from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';

import { RemoteData } from '../../../core/data/remote-data';
import { RequestService } from '../../../core/data/request.service';
import { RouteService } from '../../../core/services/route.service';
import { NoContent } from '../../../core/shared/NoContent.model';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { WorkflowItemDataService } from '../../../core/submission/workflowitem-data.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { WorkflowItemActionPageComponent } from '../../workflow-item-action-page.component';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { WorkflowItem } from 'src/app/core/submission/models/workflowitem.model';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { environment } from '../../../../../src/environments/environment';
import { AdvancedWorkflowActionComponent } from '../advanced-workflow-action/advanced-workflow-action.component';
import { rendersAdvancedWorkflowTaskOption } from 'src/app/shared/mydspace-actions/claimed-task/switcher/claimed-task-actions-decorator';
import { WorkflowActionDataService } from 'src/app/core/data/workflow-action-data.service';
import { ClaimedTaskDataService } from 'src/app/core/tasks/claimed-task-data.service';

export const ADVANCED_WORKFLOW_TASK_OPTION_SELECT_COLLECTION = "submit_selectCollection";
export const ADVANCED_WORKFLOW_ACTION_SELECT_COLLECTION = 'selectCollection';

@rendersAdvancedWorkflowTaskOption(ADVANCED_WORKFLOW_ACTION_SELECT_COLLECTION)
@Component({
  selector: 'ds-workflow-select-collection',
  templateUrl: './workflow-select-collection.component.html',
})
/**
 * Component representing a page to change the collection of a workflow item
 */
export class WorkflowSelectCollectionComponent extends AdvancedWorkflowActionComponent {

  selectorType = DSpaceObjectType.COLLECTION;
  wfitemRD$: Observable<RemoteData<WorkflowItem>>;

  wfitem: WorkflowItem;
  processing = false;

  collectionId: String;

  // selectorType = DSpaceObjectType.COLLECTION;

  originalCollection: Collection;

  selectedCollectionName: string;
  // selectedCollectionHandle: String;
  selectedCollection: Collection;
  canSubmit = false;

  /**
   * Route to the item's page
   */
  itemPageRoute$: Observable<string>;

  COLLECTIONS = [DSpaceObjectType.COLLECTION];

  uuid: String;



  constructor(protected route: ActivatedRoute,
              protected workflowItemService: WorkflowItemDataService,
              protected router: Router,
              protected routeService: RouteService,
              protected notificationsService: NotificationsService,
              protected translationService: TranslateService,
              protected workflowActionService: WorkflowActionDataService,
              protected claimedTaskDataService: ClaimedTaskDataService,
              protected requestService: RequestService,
              protected location: Location,
              protected dsoNameService: DSONameService,
              protected collectionDataService: CollectionDataService,
  ) {
    super(route, workflowItemService, router, routeService, notificationsService, translationService, workflowActionService , claimedTaskDataService, requestService, location);
  }

  createBody() {
    return {
      [ADVANCED_WORKFLOW_TASK_OPTION_SELECT_COLLECTION]: 'true',
      "collection_id": this.collectionId,
    };
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.wfi$.subscribe(
      wfi =>{
        this.wfitem = wfi;
      }
    );

    this.uuid = this.wfitem.uuid;

    this.collectionDataService.findByHref(`${environment.rest.baseUrl}/api/core/collections/${this.wfitem.sections.collection}`).subscribe(collection => {
      this.originalCollection = collection?.payload;
      this.selectedCollection = this.originalCollection;
      this.selectedCollectionName = this.selectedCollection.name;
    });
  }


  selectDso(data: any): void {
    this.selectedCollection = data;
    this.collectionId = this.selectedCollection.uuid;
    this.selectedCollectionName = this.dsoNameService.getName(data);
    if (this.selectedCollectionName == "Autoarchivo"){
      this.canSubmit = false;
    }else{
      this.canSubmit = true;
    }
  }
  /**
   * Returns the type of page
   */
  getType(): string {
    return ADVANCED_WORKFLOW_ACTION_SELECT_COLLECTION;
  }

}
