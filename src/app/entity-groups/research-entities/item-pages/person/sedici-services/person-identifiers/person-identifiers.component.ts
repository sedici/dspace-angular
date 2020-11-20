import { Component, Input } from '@angular/core';
import { Item } from 'src/app/core/shared/item.model';

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
      name: "OrcId:"
    },
    {
      urlMetadata:"person.scopus-author-id.url",
      identifierMetadata: "person.scopus-author-id.url",
      name: "Scopus id:"
    },
    {
      urlMetadata: "person.rid.url",
      identifierMetadata: "person.identifier.rid",
      name: "Researcher ID:"
    },
    {
      urlMetadata: "person.identifier.gsid",
      identifierMetadata: "person.identifier.gsid",
      name: "Google Scholar ID:"
    }
  ]

}
