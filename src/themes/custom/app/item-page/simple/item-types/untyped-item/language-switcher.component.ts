import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIf, NgFor } from '@angular/common';
import { MetadataFieldWrapperComponent } from 'src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { TranslateModule } from '@ngx-translate/core';
import { TruncatableComponent } from 'src/app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from 'src/app/shared/truncatable/truncatable-part/truncatable-part.component';

@Component({
  selector: 'language-switcher',
  styleUrls: ['./language-switcher.component.scss'],
  templateUrl: './language-switcher.component.html',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MetadataFieldWrapperComponent,
    TranslateModule,
    TruncatableComponent,
    TruncatablePartComponent,
  ],
})
export class LanguageSwitcherComponent {
  @Input() item: any;
  selectedLanguage: string;
  availableLanguages: any[];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.selectedLanguage = this.item.metadata['dc.language']?.[0]?.value || 'es';
    this.availableLanguages = this.getAvailableLanguages();
  }

  getAbstract(): SafeHtml {
    const abstracts = this.item.metadata['dc.description.abstract'];
    if (!abstracts) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    const abstract = abstracts.find((abstract: any) => (abstract.language || 'es') === this.selectedLanguage)?.value || '';
    return this.sanitizer.bypassSecurityTrustHtml(abstract);
  }

  changeLanguage(language: string) {
    this.selectedLanguage = language;
  }

  getAvailableLanguages() {
    const abstracts = this.item.metadata['dc.description.abstract'];
    if (!abstracts) {
      return [];
    }
    return [...new Set(abstracts.map((abstract: any) => abstract.language))];
  }
}