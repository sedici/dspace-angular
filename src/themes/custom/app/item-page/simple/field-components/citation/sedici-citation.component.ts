
import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-bibtex';
import { MetadatumViewModel } from 'src/app/core/shared/metadata.models';
import * as CSL from 'citeproc';

@Component({
  selector: 'sedici-citation',
  templateUrl: './sedici-citation.component.html',
  styleUrls: ['./sedici-citation.component.scss'],
  standalone: true,
  imports: [],
})
export class SediciCitationComponent implements OnInit {

  @Input() metadata: MetadatumViewModel[];

  jsonData: any = {};

  @ViewChild('elementContentToCopy') elementContentToCopy: ElementRef;
  citation: string;
  citationType: string = 'apa';

  citationOptions = [
    { value: 'apa', label: 'APA' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'mla', label: 'MLA' },
    { value: 'bibtex', label: 'BibTex' },
  ];

  copySuccess: boolean = false;

  constructor(public activeModal: NgbActiveModal) {}

  async ngOnInit() {
    this.jsonData = this.metadataToJSON(this.metadata);
    this.generateCitation(this.citationType);
  }

  private metadataToJSON(metadata: MetadatumViewModel[]) {
    var data = { id: '1' };
    var autores = []
    for (let i = 0; i < metadata.length; i++) {
      switch (metadata[i].key){
        case "sedici.subtype":
          data['type'] = this.identificarTipo(metadata[i].value);
          break;
        case "dc.title":
          data['title'] = metadata[i].value.replace(/"/g, '\\"');
          break;
        case "sedici.creator.person":
          autores.push(metadata[i].value);
          break;
        case "dc.date.issued":
          data['issued'] = {
            "date-parts": [
              [metadata[i].value]
            ]
          };
          break;
        case "sedici.identifier.issn":
          data['ISSN'] = metadata[i].value;
          break;
        case "sedici.identifier.isbn":
          data['ISBN'] = metadata[i].value;
          break;
        case "dc.identifier.uri":
          const match = metadata[i].value.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
          if (match != null) {
            data['DOI'] = match[0];
            break;
          } else {
            data['URL'] = metadata[i].value;
            break;
          }
        case "dc.publisher":
          data['publisher'] = metadata[i].value;
          break;
        case "dc.relation.ispartof":
          data['container-title'] = metadata[i].value;
          break;
        case "dc.format.extent":
          data['section'] = metadata[i].value;
          break;
        case "sedici.identifier.other":
          const exp = metadata[i].value.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
          if (exp != null) {
            data['DOI'] = exp[0];
            break;
          }
          break;
        case "sedici.relation.journalTitle":
          data['source'] = metadata[i].value;
          break;
        case "sedici.relation.journalVolumeAndIssue":
          data['volume-title'] = metadata[i].value;
          break;
      }
    }

    data['author'] = []
    for (let i = 0; i < autores.length; i++) {
      const partes = autores[i].split(',');
      data['author'].push({
        given: partes[1],
        family: partes[0]
      });
    }
    return data;
  }

  private identificarTipo(tipo: String) {
    switch(tipo){
      case "Articulo":
        return "article";
      case "Capitulo de libro":
        return "chapter";
      case "Libro":
        return "book";
      case "Tesis de maestria":
        return "thesis";
      case "Trabajo de especializacion":
        return "thesis";
      case "Tesis de grado":
        return "thesis";
      case "Tesis de doctorado":
        return "thesis";
      case "Conjunto de datos":
        return "dataset";
      default:
        return 'document';
    }
  }

  async generateCitation(type: string) {
    if (type === 'bibtex') {
      const cite = new Cite(this.jsonData);
      this.citation = cite.format('bibtex', {
        format: 'text',
      });
      return;
    }

    const styles = {
      apa: 'https://raw.githubusercontent.com/citation-style-language/styles/master/apa-no-ampersand.csl',
      chicago: 'https://raw.githubusercontent.com/citation-style-language/styles/master/chicago-author-date.csl',
      mla: 'https://raw.githubusercontent.com/citation-style-language/styles/master/modern-language-association.csl',
    };

    const styleURL = styles[type];
    const localeURL = 'https://raw.githubusercontent.com/citation-style-language/locales/master/locales-es-ES.xml';

    const [styleResponse, localeResponse] = await Promise.all([
      fetch(styleURL),
      fetch(localeURL),
    ]);

    const style = await styleResponse.text();
    const locale = await localeResponse.text();

    const sys = {
      retrieveLocale: () => locale,
      retrieveItem: () => this.jsonData,
    };

    const engine = new CSL.Engine(sys, style);
    engine.updateItems([this.jsonData.id]);

    const result = engine.makeBibliography();
    const citationHTML = result[1][0];
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(citationHTML, "text/html").documentElement.textContent;
    this.citation = decodedString;
  }

  onCitationTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.citationType = selectElement.value;
    this.generateCitation(this.citationType);
  }
  
  copyToClipboard(element: HTMLDivElement) {
    navigator.clipboard.writeText(element.innerText).then(() => {
      this.copySuccess = true;
      setTimeout(() => this.copySuccess = false, 2000); // Ocultar el mensaje después de 2 segundos
    }).catch(err => {
      console.error('Error al copiar el texto: ', err);
    });
  }

  close() {
    this.activeModal.close();
  }
}
