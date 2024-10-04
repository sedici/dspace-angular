import { Component, Input, OnInit } from '@angular/core';
import { MetadataValuesComponent } from 'src/app/item-page/field-components/metadata-values/metadata-values.component';
import { MetadataFieldWrapperComponent } from 'src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { TranslateModule } from '@ngx-translate/core';

/**
 * This component renders the configured 'values' into the ds-metadata-field-wrapper component.
 * It puts the given 'separator' between each two values.
 */
@Component({
  selector: 'ds-sedici-language-metadata-values',
  templateUrl: './sedici-language-metadata-values.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    MetadataValuesComponent,
    MetadataFieldWrapperComponent,
  ],
})
export class SediciLanguageMetadataValuesComponent extends MetadataValuesComponent implements OnInit {
  @Input() inlineLabel: boolean = true;
  languageString: string;

  ngOnInit(): void {
      const language = this.mdValues?.[0]?.value;
      if (language === 'es') {
        this.languageString = 'Español';
      } else if (language === 'en') {
        this.languageString = 'Inlgés';
      } else if (language === 'pt') {
        this.languageString = 'Portugués';
      }
  }
}
