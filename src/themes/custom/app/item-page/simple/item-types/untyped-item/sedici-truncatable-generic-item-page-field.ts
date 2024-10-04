import { Component, Input } from '@angular/core';
import { Item } from 'src/app/core/shared/item.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIf, NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MetadataFieldWrapperComponent } from 'src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { TruncatableComponent } from 'src/app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from 'src/app/shared/truncatable/truncatable-part/truncatable-part.component';

@Component({
  selector: 'sedici-truncatable-generic-item-page-field',
  styleUrls: ['./sedici-truncatable-generic-item-page-field.scss'],
  templateUrl: './sedici-truncatable-generic-item-page-field.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    TranslateModule,
    MetadataFieldWrapperComponent,
    TruncatableComponent,
    TruncatablePartComponent,
  ],
})
export class SediciTruncatableGenericItemPageFieldComponent {
  @Input() item: Item;
  @Input() fields: string[];
  @Input() label: string;
  @Input() minLines: number = 4;
  metadataTextValue: SafeHtml;
  length: number = -1;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.metadataTextValue = this.getMetadataText();
  }

  getMetadataText(): SafeHtml {
    let metadataArray: any[];
    metadataArray = this.item.allMetadata(this.fields);
    let concat = '';
    metadataArray.forEach((metadata, index) => {
      concat += metadata.value;
      if (index < metadataArray.length - 1) {
        concat += '\n';
      }
    });
    if (concat.length > 0) {
      this.length = concat.length;
      return this.sanitizer.bypassSecurityTrustHtml(concat);
    }
    return this.sanitizer.bypassSecurityTrustHtml('');
  }
}