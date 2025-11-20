import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
export class LanguageSwitcherComponent implements OnInit {
  @Input() item: any;
  selectedLanguage: string;
  availableLanguages: any[];
  abstracts: any[];

  constructor(
    private sanitizer: DomSanitizer,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.abstracts = this.item.metadata['dc.description.abstract'] || [];
    this.availableLanguages = this.getAvailableLanguages();

    this.initializeLanguage();
  }

  initializeLanguage() {
    if (!this.hasAbstract()) return;

    const globalLang = this.translate.currentLang.split('-')[0];
    const matchGlobal = this.abstracts.find((a: any) => (a.language || '??') === globalLang);

    if (matchGlobal) {
      this.selectedLanguage = globalLang;
    } else {
      this.selectedLanguage = this.abstracts[0].language || '??';
    }
  }

  hasAbstract(): boolean {
    return this.abstracts && this.abstracts.length > 0;
  }

  getAbstract(): SafeHtml {
    if (this.abstracts && this.selectedLanguage) {
      const abstract = this.abstracts.find((a: any) => (a.language || '??') === this.selectedLanguage);
      
      if (abstract) {
        return this.sanitizer.bypassSecurityTrustHtml(abstract.value);
      }
    }
    return this.sanitizer.bypassSecurityTrustHtml('');
  }

  changeLanguage(language: string) {
    this.selectedLanguage = language;
  }

  getAvailableLanguages() {
    if (this.abstracts) {
      return [...new Set(this.abstracts.map((abstract: any) => (abstract.language || '??')))];
    }
    return [];
  }
}