import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { plugins, Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-bibtex';
import { MetadatumViewModel } from 'src/app/core/shared/metadata.models';

@Component({
  selector: 'sedici-citation',
  templateUrl: './sedici-citation.component.html',
  styleUrls: ['./sedici-citation.component.scss'],
  standalone: true,
  imports: [CommonModule],
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

  constructor(public activeModal: NgbActiveModal) {}

  async ngOnInit() {
    const resMla = await fetch(
      'https://raw.githubusercontent.com/citation-style-language/styles/master/modern-language-association.csl'
    );
    const resChi = await fetch(
      'https://raw.githubusercontent.com/citation-style-language/styles/master/chicago-author-date.csl'
    );
    const mlaStyle = await resMla.text()
    const chicagoStyle = await resChi.text();
    this.jsonData = this.metadataToJSON(this.metadata);
    this.generateCitation(this.citationType);
    plugins.config.get('@csl').templates.add('mla', mlaStyle);
    plugins.config.get('@csl').templates.add('chicago-author-date', chicagoStyle);
  }

  private metadataToJSON(metadata: MetadatumViewModel[]) {
    var data = {};
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

  generateCitation(type: string): void {
    const cite = new Cite(this.jsonData);
    if (type === 'apa') {
      this.citation = cite.format('bibliography', {
        format: 'text',
        template: 'apa'
      });
    } else if (type === 'bibtex') {
       this.citation = cite.format('bibtex', {
        format: 'text',
      });
    } else if (type === 'mla'){
      this.citation = cite.format('bibliography', {
        format: 'text',
        template: 'mla'
      });
    } else if (type === 'chicago'){
      this.citation = cite.format('bibliography', {
        format: 'text',
        template: 'chicago-author-date'
      });
    }
  }

  onCitationTypeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.citationType = selectElement.value;
    this.generateCitation(this.citationType);
  }

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

  close() {
    this.activeModal.close();
  }
}
