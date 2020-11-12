import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Item } from '../../../../../../core/shared/item.model';
import { RelationshipService } from '../../../../../../core/data/relationship.service';
import { FindListOptions } from '../../../../../../core/data/request.models';
import { map } from 'rxjs/operators';




@Component({
  selector: 'ds-person-statistics',
  templateUrl: './person-statistics.component.html',
  styleUrls: ['./person-statistics.component.scss']
})
export class PersonStatisticsComponent implements OnInit {

  constructor(public relationshipService: RelationshipService) {
  }

  /**
   * The item to render relationships for
   */
  @Input() item: Item;

  options = new FindListOptions();

  publications: Observable<Item[]>;

  ngOnInit(): void {
    this.setPublications()
  }

  setPublications(){
    this.publications =  this.relationshipService.getRelatedItemsByLabel(this.item, 'isPublicationOfAuthor').pipe(
      map(value => value.payload.page)
    );
  }

}
