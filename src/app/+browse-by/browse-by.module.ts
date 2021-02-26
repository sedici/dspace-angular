import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowseByTitlePageComponent } from './+browse-by-title-page/browse-by-title-page.component';
import { SharedModule } from '../shared/shared.module';
import { BrowseByMetadataPageComponent } from './+browse-by-metadata-page/browse-by-metadata-page.component';
import { BrowseByDatePageComponent } from './+browse-by-date-page/browse-by-date-page.component';
import { BrowseBySwitcherComponent } from './+browse-by-switcher/browse-by-switcher.component';

const ENTRY_COMPONENTS = [
  // put only entry components that use custom decorator
  BrowseByTitlePageComponent,
  BrowseByMetadataPageComponent,
  BrowseByDatePageComponent
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    BrowseBySwitcherComponent,
    ...ENTRY_COMPONENTS
  ],
  exports: [
    BrowseBySwitcherComponent
  ]
})
export class BrowseByModule {
  /**
   * NOTE: this method allows to resolve issue with components that using a custom decorator
   * which are not loaded during CSR otherwise
   */
  static withEntryComponents() {
    return {
      ngModule: SharedModule,
      providers: ENTRY_COMPONENTS.map((component) => ({provide: component}))
    };
  }
}
