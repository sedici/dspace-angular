import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-search-dropdown',
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
  ],
})
/**
 * This components renders a search dropdown including the label.
 * The options should still be provided in the content.
 */
export class SearchDropdownComponent {
  @Input() id: string;
  @Output() changed: EventEmitter<any> = new EventEmitter<number>();
}
