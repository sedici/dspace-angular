import {
  Component,
  Input,
} from '@angular/core';

import { Item } from 'src/app/core/shared/item.model';
import { MetadataValuesComponent } from 'src/app/item-page/field-components/metadata-values/metadata-values.component';
import { MetadataValue } from 'src/app/core/shared/metadata.models';

@Component({
  selector: 'ds-item-page-identifier-other-field',
  templateUrl: './item-page-identifier.other-field.html', 
  standalone: true,
  imports: [MetadataValuesComponent],
})

export class ItemPageIdentifierOtherFieldComponent{

  /**
   * The item to display metadata for
   */
  @Input() item: Item;

  /**
   * Fields (schema.element.qualifier) used to render their values.
   */
  fields: string[] = ['sedici.identifier.other'];

  /**
   * Label i18n key for the rendered metadata
   */
  label: string = 'Otros idenfiticadores';

  /**
   * Separator string between multiple values of the metadata fields defined
   * @type {string}
   */
  separator = '<br/>';

  mdValues: MetadataValue[];

  ngOnInit() {
    this.selectNotPersistentIdentifiers(); 
  }

  selectNotPersistentIdentifiers(): void {
    const persistentIdentifiers = ['doi', 'DOI', 'handle', 'hdl', 'arxiv', 'arXiv', 'pmcid', 'pmid', 'ark'];
    this.mdValues = this.item.allMetadata(this.fields).filter(mdValue => {
      return !persistentIdentifiers.some(identifier => mdValue.value.includes(identifier));
    });
  }
}
