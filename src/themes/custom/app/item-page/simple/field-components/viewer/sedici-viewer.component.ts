import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalSwipeBackDirective } from 'src/themes/custom/app/shared/utils/modal-swipe-back.directive';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'sedici-viewer',
  templateUrl: './sedici-viewer.component.html',
  styleUrls: ['./sedici-viewer.component.scss'],
  standalone: true,
  imports: [ModalSwipeBackDirective, NgTemplateOutlet],
})
export class SediciViewerComponent {
  @Input() content: any;
  @Input() headerTemplate: any;
  @Input() embargoedFile: boolean;
  @Input() isAssetAvailable: boolean;

  constructor(public activeModal: NgbActiveModal) {}

  close() {
    this.activeModal.close();
  }
}
