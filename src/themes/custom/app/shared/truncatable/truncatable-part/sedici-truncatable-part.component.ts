import { NgIf } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { DragClickDirective } from 'src/app/shared/utils/drag-click.directive';

import { TruncatablePartComponent } from "src/app/shared/truncatable/truncatable-part/truncatable-part.component";

@Component({
  selector: 'sedici-truncatable-part',
  templateUrl: './sedici-truncatable-part.component.html',
  styleUrls: ['./sedici-truncatable-part.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    DragClickDirective,
  ],
})

export class SediciTruncatablePartComponent extends TruncatablePartComponent {
  @Input() showCollapseButton = true;
}
