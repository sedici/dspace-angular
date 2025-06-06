import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgIf, NgFor } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    TranslateModule,
    TruncatableComponent,
    TruncatablePartComponent,
  ],
})
export class LanguageSwitcherComponent {
  @Input() item: any;
  selectedLanguage: string;
  availableLanguages: any[];
  abstractPrefix: string;

  constructor(private sanitizer: DomSanitizer, private translateService: TranslateService ) {}

  ngOnInit() {
    const langValue = this.item.metadata['dc.language']?.[0]?.value;
    this.selectedLanguage = !langValue || langValue === 'other' ? '??' : langValue;
    this.availableLanguages = this.getAvailableLanguages();

    this.translateService.get('item.page.abstract').subscribe((res: string) => {
      this.abstractPrefix = res + ': ';
    });
  }

  getAbstract(): SafeHtml {
    const abstracts = this.item.metadata['dc.description.abstract'];
    if (abstracts) {
      let abstract = abstracts.find((abstract: any) => (abstract.language || '??') === this.selectedLanguage)?.value || '';
      if (!abstract) {
        abstract = abstracts[0].value;
        this.selectedLanguage = abstracts[0].language;
      }
      abstract = this.abstractPrefix + abstract;
      return this.sanitizer.bypassSecurityTrustHtml(abstract);
    }
    return this.sanitizer.bypassSecurityTrustHtml('');
  }

  changeLanguage(language: string) {
    this.selectedLanguage = language;
  }

  getAvailableLanguages() {
    const abstracts = this.item.metadata['dc.description.abstract'];
    if (abstracts) {
      return [...new Set(abstracts.map((abstract: any) => (abstract.language || '??')))];
    }
    return [];
  }
}