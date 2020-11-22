import { Component, Input } from '@angular/core';
import { Item } from 'src/app/core/shared/item.model';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ds-person-identifiers',
  templateUrl: './person-identifiers.component.html',
  styleUrls: ['./person-identifiers.component.scss']
})
export class PersonIdentifiersComponent {

  @Input() item: Item;

  private identifiersMetadata = [
    {
      urlMetadata: "person.orcid.url",
      identifierMetadata: "person.identifier.orcid",
      name: this.translateService.instant("person.page.orcid")
    },
    {
      urlMetadata:"person.scopus-author-id.url",
      identifierMetadata: "person.scopus-author-id.url",
      name: this.translateService.instant("person.page.scopusid")
    },
    {
      urlMetadata: "person.rid.url",
      identifierMetadata: "person.identifier.rid",
      name: this.translateService.instant("person.page.rid")
    },
    {
      urlMetadata: "person.identifier.gsid",
      identifierMetadata: "person.identifier.gsid",
      name: this.translateService.instant("person.page.gsid")
    }
  ]

  constructor(private translateService: TranslateService) {}


}
