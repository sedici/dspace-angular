import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Item } from 'src/app/core/shared/item.model';
import { TranslateModule } from '@ngx-translate/core';
import { ItemPageCcLicenseFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component';

@Component({
  selector: 'sedici-license',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ItemPageCcLicenseFieldComponent,
    NgIf,
  ],
  templateUrl: './sedici-license.component.html',
  styleUrls: ['./sedici-license.component.scss']
})
export class SediciLicenseComponent {
  @Input() object: Item;

  license: string;

  ngOnInit() {
    this.license = this.object?.allMetadata(['sedici.rights.license'])[0]?.value;
  }
}