import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { Item } from 'src/app/core/shared/item.model';
import { RouterLink } from '@angular/router';
import { getItemPageRoute } from 'src/app/item-page/item-page-routing-paths';
import { TranslateModule } from '@ngx-translate/core';

import { GenericItemPageFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { SediciDateMetadataValuesComponent } from '../../field-components/date-metadata-values/sedici-date-metadata-values.component';
import { SediciLanguageMetadataValuesComponent } from '../../field-components/language-metadata-values/sedici-language-metadata-values.component';
import { CollectionsComponent } from 'src/app/item-page/field-components/collections/collections.component';
import { ItemPageIdentifierOtherFieldComponent } from '../../field-components/specific-field/identfier-other/item-page-identifier.other-field';
@Component({
  selector: 'full-item',
  // styleUrls: ['./full-item.component.scss'],
  templateUrl: './full-item.component.html',
  standalone: true,
  imports: [
    NgFor,
    RouterLink,
    TranslateModule,
    GenericItemPageFieldComponent,
    SediciDateMetadataValuesComponent,
    SediciLanguageMetadataValuesComponent,
    CollectionsComponent,
    ItemPageIdentifierOtherFieldComponent,
  ],
})
export class FullItemComponent {
  @Input() object: Item;
  itemPageRoute: string;

  ngOnInit(): void {
    this.itemPageRoute = getItemPageRoute(this.object);
  }
}