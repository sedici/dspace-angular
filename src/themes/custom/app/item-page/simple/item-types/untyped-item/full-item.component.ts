import { Component, Input } from '@angular/core';

import { Item } from 'src/app/core/shared/item.model';
import { RouterLink } from '@angular/router';
import { getItemPageRoute } from 'src/app/item-page/item-page-routing-paths';
import { TranslateModule } from '@ngx-translate/core';

import { GenericItemPageFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { CollectionsComponent } from 'src/app/item-page/field-components/collections/collections.component';
import { ItemPageIdentifierOtherFieldComponent } from '../../field-components/specific-field/identfier-other/item-page-identifier.other-field';

interface MetadataMapping {
  fieldName: string;        // Nombre del campo de metadatos (dc.date.issued, etc.)
  labelKey: string;         // Clave para la traducción (sedici.item.page.dc.date.issued)
  specialType?: string;     // Para campos que requieren tratamiento especial (date, language)
}
@Component({
  selector: 'full-item',
  styleUrls: ['./full-item.component.scss'],
  templateUrl: './full-item.component.html',
  standalone: true,
  imports: [
    RouterLink,
    TranslateModule,
    GenericItemPageFieldComponent,
    CollectionsComponent,
    ItemPageIdentifierOtherFieldComponent
],
})
export class FullItemComponent {
  @Input() object: Item;
  itemPageRoute: string;

  metadataMappings: MetadataMapping[] = [
    { fieldName: 'dc.date.issued', labelKey: 'sedici.item.page.dc.date.issued', specialType: 'date' },
    { fieldName: 'dc.date.created', labelKey: 'sedici.item.page.dc.date.created', specialType: 'date' },
    { fieldName: 'sedici.date.exposure', labelKey: 'sedici.item.page.sedici.date.exposure', specialType: 'date' },
    { fieldName: 'dc.description.filiation', labelKey: 'sedici.item.page.dc.description.filiation' },
    { fieldName: 'sedici.identifier.expediente', labelKey: 'sedici.item.page.sedici.identifier.expediente' },
    { fieldName: 'mods.location', labelKey: 'sedici.item.page.mods.location' },
    { fieldName: 'sedici.subject.ford', labelKey: 'sedici.item.page.sedici.subject.ford' },
    { fieldName: 'dc.language', labelKey: 'sedici.item.page.dc.language', specialType: 'language' },
    // Identificadores especiales se manejan aparte
    { fieldName: 'sedici.relation.event', labelKey: 'sedici.item.page.sedici.relation.event' },
    { fieldName: 'sedici.relation.journalTitle', labelKey: 'sedici.item.page.sedici.relation.journalTitle' },
    { fieldName: 'sedici.relation.journalVolumeAndIssue', labelKey: 'sedici.item.page.sedici.relation.journalVolumeAndIssue' },
    { fieldName: 'sedici.relation.bookTitle', labelKey: 'sedici.item.page.sedici.relation.bookTitle' },
    { fieldName: 'sedici.relation.ciclo', labelKey: 'sedici.item.page.sedici.relation.ciclo' },
    { fieldName: 'dc.format.extent', labelKey: 'sedici.item.page.dc.format.extent' },
    { fieldName: 'dc.date.accessioned', labelKey: 'sedici.item.page.dc.date.accessioned', specialType: 'date' }
  ];

  metadataRows: { label: string, values: string[] }[] = [];

  ngOnInit(): void {
    this.itemPageRoute = getItemPageRoute(this.object);
    this.processMetadata();
  }

  processMetadata() {
    this.metadataRows = [];
    
    this.metadataMappings.forEach(mapping => {
      const label = mapping.labelKey;
      let values: string[] = [];
      
      if (mapping.specialType === 'date') {
        values = this.getDateValues(mapping.fieldName);
      } else if (mapping.specialType === 'language') {
        values = this.getLanguageValues(mapping.fieldName);
      } else {
        values = this.getGenericValues(mapping.fieldName);
      }
      
      if (values.length > 0) {
        this.metadataRows.push({ label, values });
      }
    });
  }

  getDateValues(fieldName: string): string[] {
    const date = this.object?.allMetadata([fieldName])[0]?.value;
    let dateString: string;
    if (date !== undefined) {
      if (date.length === 10 || date.includes('T')) {
        dateString = new Date(date).toLocaleDateString('es-AR',{ year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
      } else if (date.length === 7) {
        dateString = new Date(date).toLocaleDateString('es-AR',{ year: 'numeric', month: 'long', timeZone: 'UTC' });
      } else {
        dateString = date;
      }
      return [dateString];
    } 
    return [];
  }

  getLanguageValues(fieldName: string): string[] {
    const language = this.object?.allMetadata([fieldName])[0].value;
    let languageString: string;
    if (language === 'es') {
      languageString = 'Español';
    } else if (language === 'en') {
      languageString = 'Inlgés';
    } else if (language === 'pt') {
      languageString = 'Portugués';
    } else if (language === 'de') {
      languageString = 'Alemán';
    }
    return [languageString];
  }

  getGenericValues(fieldName: string): string[] {
    const values = this.object?.allMetadata([fieldName]);
    return values.map(value => value.value);
  }
}