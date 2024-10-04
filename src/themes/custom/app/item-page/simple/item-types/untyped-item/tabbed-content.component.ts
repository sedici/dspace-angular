import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from 'src/app/core/shared/item.model';
import { ItemPageCcLicenseFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component';
import { FullItemComponent } from './full-item.component';
import { ContentFilesComponent } from './content-files.component';
import { ApaCitationComponent } from './apa-citation.component';

@Component({
  selector: 'ds-tabbed-content',
  standalone: true,
  imports: [
    CommonModule,
    ItemPageCcLicenseFieldComponent,
    FullItemComponent,
    ContentFilesComponent,
    ApaCitationComponent,
  ],
  templateUrl: './tabbed-content.component.html',
  styleUrls: ['./tabbed-content.component.scss']
})
export class TabbedContentComponent {
  @Input() object: Item;

  selectedTabIndex = 0;

  tabs = [
    { label: 'Contenido' },
    { label: 'Licencia' },
    { label: 'Cita' },
    { label: 'Registro completo' }
  ];

  selectTab(index: number) {
    this.selectedTabIndex = index;
  }
}