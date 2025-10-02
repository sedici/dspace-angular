import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { TruncatableComponent } from 'src/app/shared/truncatable/truncatable.component';
import { TruncatablePartComponent } from 'src/app/shared/truncatable/truncatable-part/truncatable-part.component';

@Component({
  selector: 'language-switcher',
  styleUrls: ['./language-switcher.component.scss'],
  templateUrl: './language-switcher.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    TruncatableComponent,
    TruncatablePartComponent
],
})
export class LanguageSwitcherComponent {
  @Input() item: any;
  selectedLanguage: string;
  availableLanguages: any[];
  abstracts: any[];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const langValue = this.item.metadata['dc.language']?.[0]?.value;
    this.selectedLanguage = !langValue || langValue === 'other' ? '??' : langValue;
    this.abstracts = this.item.metadata['dc.description.abstract'];
    this.availableLanguages = this.getAvailableLanguages();
  }

  hasAbstract(): boolean {
    return this.abstracts && this.abstracts.length > 0;
  }

  getAbstract(): SafeHtml {
    if (this.abstracts) {
      let abstract = this.abstracts.find((abstract: any) => (abstract.language || '??') === this.selectedLanguage)?.value || '';
      if (!abstract) {
        abstract = this.abstracts[0].value;
        this.selectedLanguage = this.abstracts[0].language;
      }
      return this.sanitizer.bypassSecurityTrustHtml(abstract);
    }
    return this.sanitizer.bypassSecurityTrustHtml('');
  }

  changeLanguage(language: string) {
    this.selectedLanguage = language;
  }

  getAvailableLanguages() {
    if (this.abstracts) {
      return [...new Set(this.    abstracts.map((abstract: any) => (abstract.language || '??')))];
    }
    return [];
  }
}