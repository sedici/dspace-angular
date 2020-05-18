import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkflowItemActionPageComponent } from '../workflow-item-action-page.component';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowItemDataService } from '../../core/submission/workflowitem-data.service';
import { RouteService } from '../../core/services/route.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { RequestService } from '../../core/data/request.service';

@Component({
  selector: 'ds-workflow-item-delete',
  templateUrl: '../workflow-item-action-page.component.html'
})
/**
 * Component representing a page to delete a workflow item
 */
export class WorkflowItemDeleteComponent extends WorkflowItemActionPageComponent {
  constructor(protected route: ActivatedRoute,
              protected workflowItemService: WorkflowItemDataService,
              protected router: Router,
              protected routeService: RouteService,
              protected notificationsService: NotificationsService,
              protected translationService: TranslateService,
              protected requestService: RequestService) {
    super(route, workflowItemService, router, routeService, notificationsService, translationService);
  }

  /**
   * Returns the type of page
   */
  getType(): string {
    return 'delete';
  }

  /**
   * Performs the action of this workflow item action page
   * @param id The id of the WorkflowItem
   */
  sendRequest(id: string): Observable<boolean> {
    this.requestService.removeByHrefSubstring('/discover');
    return this.workflowItemService.delete(id);
  }
}
