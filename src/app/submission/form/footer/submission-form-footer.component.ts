import { WorkflowItemDataService } from './../../../core/submission/workflowitem-data.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import {
  Observable,
  of as observableOf,
  EMPTY,
  BehaviorSubject,
} from 'rxjs';
import {
  Router,
  NavigationExtras,
} from '@angular/router';
import {
  map,
  mergeMap,
  tap,
} from 'rxjs/operators';

import { SubmissionRestService } from '../../../core/submission/submission-rest.service';
import { SubmissionScopeType } from '../../../core/submission/submission-scope-type';
import { BtnDisabledDirective } from '../../../shared/btn-disabled.directive';
import { isNotEmpty } from '../../../shared/empty.util';
import { BrowserOnlyPipe } from '../../../shared/utils/browser-only.pipe';
import { SubmissionService } from '../../submission.service';
import { WorkflowItem } from 'src/app/core/submission/models/workflowitem.model';
import { ClaimedTask } from 'src/app/core/tasks/models/claimed-task-object.model';
import { ClaimedTaskDataService } from 'src/app/core/tasks/claimed-task-data.service';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteData } from 'src/app/core/shared/operators';
import { Item } from 'src/app/core/shared/item.model';
import { MyDSpaceActionsResult } from 'src/app/shared/mydspace-actions/mydspace-actions';
import { RemoteData } from 'src/app/core/data/remote-data';
import { LinkService } from 'src/app/core/cache/builders/link.service';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { getAdvancedWorkflowRoute } from 'src/app/workflowitems-edit-page/workflowitems-edit-page-routing-paths';

/**
 * This component represents submission form footer bar.
 */
@Component({
  selector: 'ds-submission-form-footer',
  styleUrls: ['./submission-form-footer.component.scss'],
  templateUrl: './submission-form-footer.component.html',
  standalone: true,
  imports: [CommonModule, BrowserOnlyPipe, TranslateModule, NgbTooltipModule, BtnDisabledDirective],
})
export class SubmissionFormFooterComponent implements OnChanges {

  /**
   * The submission id
   * @type {string}
   */
  @Input() submissionId: string;

  @Input() item: Item;

  /**
   * A boolean representing if a submission deposit operation is pending
   * @type {Observable<boolean>}
   */
  public processingDepositStatus: Observable<boolean>;

  /**
   * A boolean representing if a submission save operation is pending
   * @type {Observable<boolean>}
   */
  public processingSaveStatus: Observable<boolean>;

  /**
   * A boolean representing if showing deposit and discard buttons
   * @type {Observable<boolean>}
   */
  public showDepositAndDiscard: Observable<boolean>;

  /**
   * A boolean representing if submission form is valid or not
   * @type {Observable<boolean>}
   */
  public submissionIsInvalid: Observable<boolean> = observableOf(true);

  /**
   * A boolean representing if submission form has unsaved modifications
   */
  public hasUnsavedModification: Observable<boolean>;

  public wfi: WorkflowItem;

  public ctobject: ClaimedTask;

  @Output() processCompleted = new EventEmitter<MyDSpaceActionsResult>();

  /**
   * Initialize instance variables
   *
   * @param {NgbModal} modalService
   * @param {SubmissionRestService} restService
   * @param {SubmissionService} submissionService
   */
  constructor(private modalService: NgbModal,
              private restService: SubmissionRestService,
              private submissionService: SubmissionService,
              private wfService: WorkflowItemDataService,
              private ctService: ClaimedTaskDataService,
              protected linkService: LinkService,
              private router: Router ) {
  }

  ngInit(){
    }

  /**
   * Initialize all instance variables
   */
  ngOnChanges(changes: SimpleChanges) {
    if (isNotEmpty(this.submissionId)) {
      this.submissionIsInvalid = this.submissionService.getSubmissionStatus(this.submissionId).pipe(
        map((isValid: boolean) => isValid === false),
      );

      if (!this.showDepositAndDiscard){
        this.wfService.findById(this.submissionId).subscribe(workflowItem =>{
          this.wfi = workflowItem.payload; // Esto asume que payload es de tipo WorkflowIte
        })
        this.ctService.findByItem(this.item.uuid).subscribe(claimedTask =>{
          this.ctobject = claimedTask.payload;
        });
      }


      this.processingSaveStatus = this.submissionService.getSubmissionSaveProcessingStatus(this.submissionId);
      this.processingDepositStatus = this.submissionService.getSubmissionDepositProcessingStatus(this.submissionId);
      this.showDepositAndDiscard = observableOf(this.submissionService.getSubmissionScope() === SubmissionScopeType.WorkspaceItem);
      this.hasUnsavedModification = this.submissionService.hasUnsavedModification();
    }
  }

  /**
   * Dispatch a submission save action
   */
  save(event) {
    this.submissionService.dispatchSave(this.submissionId, true);
  }

  redirect(){
    const navigationExtras: NavigationExtras = {
      queryParams:{
        workflow: 'editaction',
        claimedTask: this.ctobject.id,
      }
    };
    this.router.navigate([getAdvancedWorkflowRoute(this.wfi.id)], navigationExtras);
  }

  /**
   * Dispatch a submission save for later action
   */
  saveLater(event) {
    this.submissionService.dispatchSaveForLater(this.submissionId);
  }

  /**
   * Dispatch a submission deposit action
   */
  public deposit(event) {
    this.submissionService.dispatchDeposit(this.submissionId);
  }

  /**
   * Dispatch a submission discard action
   */
  public confirmDiscard(content) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'ok') {
          this.submissionService.dispatchDiscard(this.submissionId);
        }
      },
    );
  }
}
