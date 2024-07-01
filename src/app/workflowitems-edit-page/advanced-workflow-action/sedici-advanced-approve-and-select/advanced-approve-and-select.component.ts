import { Collection } from '../../../core/shared/collection.model';
import { Location } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  NavigationExtras
} from '@angular/router';
import { Observable , of} from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';

import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { RemoteData } from '../../../core/data/remote-data';
import { RequestService } from '../../../core/data/request.service';
import { RouteService } from '../../../core/services/route.service';
import { NoContent } from '../../../core/shared/NoContent.model';
import { getFirstCompletedRemoteData } from '../../../core/shared/operators';
import { WorkflowItemDataService } from '../../../core/submission/workflowitem-data.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
//import { WorkflowItemActionPageComponent } from '../../workflow-item-action-page.component';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { WorkflowItem } from 'src/app/core/submission/models/workflowitem.model';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { environment } from '../../../../../src/environments/environment';
import { AdvancedWorkflowActionComponent } from '../advanced-workflow-action/advanced-workflow-action.component';
import { WorkflowActionDataService } from 'src/app/core/data/workflow-action-data.service';
import { ClaimedTaskDataService } from 'src/app/core/tasks/claimed-task-data.service';
import { ModifyItemOverviewComponent } from '../../../item-page/edit-item-page/modify-item-overview/modify-item-overview.component';


export const ADVANCED_WORKFLOW_TASK_OPTION_APPROVE_AND_SELECT = "approve-and-select";
export const ADVANCED_WORKFLOW_ACTION_APPROVE_AND_SELECT = 'editaction';

@Component({
  selector: 'ds-workflow-approve-and-select',
  templateUrl: './advanced-approve-and-select.component.html',
  imports: [NgbTooltipModule, ModifyItemOverviewComponent, NgIf, AsyncPipe, TranslateModule],
  standalone: true,
})
/**
 * Component representing a page to change the collection of a workflow item
 */
export class WorkflowApproveAndSelectComponent extends AdvancedWorkflowActionComponent {

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
      ['submit_approve']: 'true',
    };
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.performAction();
    this.wfi$.subscribe({
      next: data => {
        this.wfitem = data;
    }});
    const navigationExtras: NavigationExtras = {
      queryParams: {workflow: 'selectCollection', claimedTask: this.route.snapshot.queryParams.claimedTask}
    };
    this.router.navigate(["/workflowitems/"+this.wfitem.id+"/advanced"], navigationExtras);
    this.redirectTo("/workflowitems/"+this.wfitem.id+"/advanced");
  }

  performAction(): void {
    this.sendRequest(this.route.snapshot.queryParams.claimedTask).subscribe((successful: boolean) => {
      if (successful) {
        const title = this.translationService.get('workflow-item.' + this.type + '.notification.success.title');
        const content = this.translationService.get('workflow-item.' + this.type + '.notification.success.content');
        this.notificationsService.success(title, content);
        //this.previousPage();
      } else {
        const title = this.translationService.get('workflow-item.' + this.type + '.notification.error.title');
        const content = this.translationService.get('workflow-item.' + this.type + '.notification.error.content');
        this.notificationsService.error(title, content);
      }
    });
  }

  redirectTo(uri: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      const navigationExtras: NavigationExtras = {
        queryParams: {workflow: 'selectCollection', claimedTask: this.route.snapshot.queryParams.claimedTask}
      };
      this.router.navigate([uri],navigationExtras)});
  }

  /**
   * Returns the type of page
   */
  getType(): string {
    return ADVANCED_WORKFLOW_ACTION_APPROVE_AND_SELECT;
  }

}
