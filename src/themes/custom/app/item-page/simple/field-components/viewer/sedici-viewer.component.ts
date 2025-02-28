import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'sedici-viewer',
  templateUrl: './sedici-viewer.component.html',
  styleUrls: ['./sedici-viewer.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class SediciViewerComponent {
  @Input() content: any;
  @Input() headerTemplate: any;
  @Input() embargoedFile: boolean;

  constructor(public activeModal: NgbActiveModal) {}

  close() {
    this.activeModal.close();
  }
}
