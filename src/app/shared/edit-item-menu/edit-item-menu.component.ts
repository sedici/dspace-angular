import { Component, Inject, OnDestroy, OnInit, Input } from '@angular/core';
import {
  AsyncPipe,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  Router,
  RouterModule,
} from '@angular/router';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import {
  NgbDropdownModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, mergeMap, startWith } from 'rxjs/operators';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { hasValue, isNotEmpty } from '../empty.util';
import { EditItemMode } from '../../core/submission/models/edititem-mode.model';
import { getAllSucceededRemoteDataPayload, getFirstSucceededRemoteListPayload } from '../../core/shared/operators';
import { EditItem } from '../../core/submission/models/edititem.model';
import { EditItemDataService } from '../../core/submission/edititem-data.service';
//import { rendersContextMenuEntriesForType } from '../context-menu.decorator'; ver para robar
import { DSpaceObjectType } from '../../core/shared/dspace-object-type.model';
//import { ContextMenuEntryComponent } from '../context-menu-entry.component'; Ver esta clase porque es de ellos
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { AuthService } from 'src/app/core/auth/auth.service';

/**
 * This component renders a context menu option that provides the links to edit item page.
 */
@Component({
  selector: 'ds-context-menu-edit-item',
  styleUrls: ['./edit-item-menu.component.scss'],
  templateUrl: './edit-item-menu.component.html',
  standalone: true,
  imports: [NgIf, NgFor, TranslateModule, RouterModule, AsyncPipe, NgbDropdownModule],
})
export class EditItemMenuComponent implements OnInit, OnDestroy {

  /**
   * A boolean representing if a request operation is pending
   * @type {BehaviorSubject<boolean>}
   */
  public processing$ = new BehaviorSubject<boolean>(false);

  /**
   * Reference to NgbModal
   */
  public modalRef: NgbModalRef;

  /**
   * List of Edit Modes available on this item
   * for the current user
   */
  private editModes$: BehaviorSubject<EditItemMode[]> = new BehaviorSubject<EditItemMode[]>([]);

  /**
   * Variable to track subscription and unsubscribe it onDestroy
   */
  private sub: Subscription;

  /**
   * The menu entry type
   */
  public menuEntryType: 'fullitem';

  /**
   * The related dso
   */
  @Input() contextMenuObject: DSpaceObject;

  /**
   * The related dso type
   */
  contextMenuObjectType: DSpaceObjectType.ITEM;

  public isAuthenticated: Observable<boolean>

  contextMenuEntriesMap: Map<DSpaceObjectType, any[]> = new Map();

  /**
   * Initialize instance variables
   *
   * @param {DSpaceObject} injectedContextMenuObject
   * @param {DSpaceObjectType} injectedContextMenuObjectType
   * @param {EditItemDataService} editItemService
   */
  constructor(
    //@Inject('contextMenuObjectProvider') protected injectedContextMenuObject: DSpaceObject,
    //@Inject('contextMenuObjectTypeProvider') protected injectedContextMenuObjectType: DSpaceObjectType,
    private editItemService: EditItemDataService,
    private authService: AuthService,
  ) {
  }

  ngOnInit(): void {
    // Retrieve edit modes
    this.isAuthenticated = this.authService.isAuthenticated();
    this.sub = this.editItemService.findById(this.contextMenuObject.id + ':none').pipe(
      getAllSucceededRemoteDataPayload(),
      mergeMap((editItem: EditItem) => editItem.modes.pipe(
        getFirstSucceededRemoteListPayload())
      ),
      startWith([])
    ).subscribe((editModes: EditItemMode[]) => {
      this.editModes$.next(editModes)
    });
  }

  /**
   * Check if edit mode is available
   */
  getEditModes(): Observable<EditItemMode[]> {
    return this.editModes$;
  }

  /**
   * Check if edit mode is available
   */
  isEditAvailable(): Observable<boolean> {
    return this.editModes$.asObservable().pipe(
      map((editModes) => isNotEmpty(editModes) && editModes.length === 1)
    );
  }

  /**
   * Make sure the subscription is unsubscribed from when this component is destroyed
   */
  ngOnDestroy(): void {
    if (hasValue(this.sub)) {
      this.sub.unsubscribe();
    }
  }

  getContextMenuEntries(): any[] {
    return this.contextMenuObjectType ? this.getContextMenuEntriesForDSOType(this.contextMenuObjectType) : [];
  }

  getContextMenuEntriesForDSOType(type: DSpaceObjectType): any[] {
    return this.contextMenuEntriesMap.get(type);
  }
}
