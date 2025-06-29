import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Item } from 'src/app/core/shared/item.model';
import { FullItemComponent } from './full-item.component';
import { ContentFilesComponent } from './content-files.component';
import { TranslateModule } from '@ngx-translate/core';
import { SediciLicenseComponent } from './sedici-license.component';
import { lareferenciaWidgetEmbedModule } from 'lareferencia-widget-embed';

@Component({
  selector: 'ds-tabbed-content',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    FullItemComponent,
    ContentFilesComponent,
    SediciLicenseComponent,
    TranslateModule,
    lareferenciaWidgetEmbedModule,
  ],
  templateUrl: './tabbed-content.component.html',
  styleUrls: ['./tabbed-content.component.scss']
})
export class TabbedContentComponent implements OnInit {
  @Input() object: Item;

  selectedTabIndex = 0;

  tabs = [
    { label: 'sedici.tabs.files', visible: true },
    { label: 'sedici.tabs.license', visible: true },
    { label: 'sedici.tabs.statistics', visible: true },
    { label: 'sedici.tabs.moreInformation', visible: true }
  ];

  ngOnInit() {
    if (!this.object?.allMetadata(['sedici.rights.license'])[0]?.value) {
      this.tabs[1].visible = false;
    }
  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
  }
}