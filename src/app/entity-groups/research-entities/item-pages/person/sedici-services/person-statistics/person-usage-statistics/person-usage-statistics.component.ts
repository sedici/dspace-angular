import { Component, Input, OnInit } from '@angular/core';
import { Item } from 'src/app/core/shared/item.model';
import { ItemStatisticsPageComponent } from '../../../../../../../statistics-page/item-statistics-page/item-statistics-page.component'
import { Observable, of } from 'rxjs';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';

@Component({
  selector: 'ds-person-usage-statistics',
  templateUrl: './person-usage-statistics.component.html',
  styleUrls: ['./person-usage-statistics.component.scss']
})
export class PersonUsageStatisticsComponent extends ItemStatisticsPageComponent implements OnInit {

  @Input() item: Item;

  /**
   * Get the scope dso for this statistics page, as an Observable.
   */
  protected getScope$(): Observable<DSpaceObject> {
    return of(this.item);
  }

}
