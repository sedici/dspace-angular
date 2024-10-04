import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MetadataValuesComponent } from 'src/app/item-page/field-components/metadata-values/metadata-values.component';
import { MetadataFieldWrapperComponent } from 'src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component';

@Component({
  selector: 'ds-badge-metadata-values',
  standalone: true,
  templateUrl: './badge-metadata-values.component.html',
  styleUrls: ['./badge-metadata-values.component.scss'],
  imports: [CommonModule, MetadataFieldWrapperComponent, TranslateModule],
})
export class BadgeMetadataValuesComponent extends MetadataValuesComponent {
  @Input() badgeType: string;
  @Input() badgeUrl: string;
  @Input() badgeLabel: string;
  @Input() badgeLabelType: string;
  @Input() copyToClipboardButton: boolean = false;
  @Input() url: string;

  copyToClipboard(el: HTMLDivElement, id: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(el.innerText).then(() => {
        document.getElementById(id).classList.remove('fa-copy');
        document.getElementById(id).classList.add('fa-check');
        setTimeout(() => {
          document.getElementById(id).classList.remove('fa-check');
          document.getElementById(id).classList.add('fa-copy');
        }, 1000);
      }, (error) => {
        console.log(error);
      });
    } else {
      console.log('Browser do not support Clipboard API');
    }
  }
}