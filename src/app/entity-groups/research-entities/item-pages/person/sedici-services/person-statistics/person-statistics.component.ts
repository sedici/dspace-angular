import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../core/shared/item.model';


@Component({
  selector: 'ds-person-statistics',
  templateUrl: './person-statistics.component.html',
  styleUrls: ['./person-statistics.component.scss']
})
export class PersonStatisticsComponent {
  /**
   * The item to render relationships for
   */
  @Input() item: Item;

}
