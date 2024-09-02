import { Component, Input, OnInit } from '@angular/core';
import { MetadataValuesComponent } from 'src/app/item-page/field-components/metadata-values/metadata-values.component';
import { MetadataFieldWrapperComponent } from 'src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { TranslateModule } from '@ngx-translate/core';

/**
 * This component renders the configured 'values' into the ds-metadata-field-wrapper component.
 * It puts the given 'separator' between each two values.
 */
@Component({
  selector: 'ds-sedici-date-metadata-values',
  templateUrl: './sedici-date-metadata-values.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    MetadataValuesComponent,
    MetadataFieldWrapperComponent,
  ],
})
export class SediciDateMetadataValuesComponent extends MetadataValuesComponent implements OnInit {
  @Input() inlineLabel: boolean;
  dateString: string;

  ngOnInit(): void {
      const date = this.mdValues?.[0]?.value;
      if (date !== undefined) {
        if (date.length === 10) {
          this.dateString = new Date(date).toLocaleDateString('es-AR',{ year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        } else if (date.length === 7) {
          this.dateString = new Date(date).toLocaleDateString('es-AR',{ year: 'numeric', month: 'long', timeZone: 'UTC' });
        } else {
          this.dateString = date;
        }
      } 
  }
}
