import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Item } from 'src/app/core/shared/item.model';
import { of } from 'rxjs';

@Component({
  selector: 'lib-lrw-lareferencia',
  templateUrl: './lrw-lareferencia.component.html',
  styleUrls: ['./lrw-lareferencia.component.scss'],
  standalone: true,
})
export class LrwLAReferenciaComponent implements AfterViewInit {

  @Input() item!: Item;

  @ViewChild('laRefernecia') laReferencia!: ElementRef<HTMLDivElement>;

  @Input() version: string = '1.1.5';
  @Input() sampleIdentifierOAI! : string;
  @Input() identifierHandle? : string = '/handle/[0-9.]+/([0-9]+)/?';
  @Input() nodoName! : string;
  @Input() repositoryName! : string;
  @Input() contryCode! : string;
  @Input() identifierMetaField? : string;
  @Input() nationalSource! : string;
  @Input() repositorySource! : string;

  show$ = of(false);

  ngOnInit(): void {
    if (
      !!this.version &&
      !!this.sampleIdentifierOAI &&
      !!this.nodoName &&
      !!this.repositoryName &&
      !!this.contryCode &&
      !!this.nationalSource &&
      !!this.repositorySource
    ) {
      this.show$ = of(true);
    }
  }

  ngAfterViewInit(): void {

    this.show$
      .subscribe(show => {
        if (show) {
          const script = document.createElement('script');
          script.innerHTML = `
            (function(w, d, s, o, p, f, js, fjs) {
              w[o] = w[o] || function() {
                  (w[o][p] = w[o][p] || {});
                  Object.assign(w[o][p], arguments[0] || {});
              };
              js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
              js.id = o;
              js.src = f;
              js.async = 1;
              fjs.parentNode.insertBefore(js, fjs);
          }(window, document, 'script', 'lrw', 'parameters', 'https://cdn.jsdelivr.net/gh/lareferencia/lrw@${this.version}/dist/lrw.js'));
          lrw({
              widget_div_id: 'usage-stats',
              identifier: '${this.sampleIdentifierOAI}:${this.item.handle}',
              ${this.identifierMetaField ? 'identifier_meta_field:"' + this.identifierMetaField + '",' : ''}
              identifier_prefix: '${this.sampleIdentifierOAI}/${this.item.handle}',
              ${this.identifierHandle ? 'identifier_regex:"' + this.identifierHandle + '",' : ''}
              event_labels: {
                  'view': 'Vistas',
                  'download': 'Descargas',
                  'outlink': 'Enlaces'
              },
              scope_labels: {
                  'L': 'LA Referencia',
                  'N': '${this.nodoName}',
                  'R': '${this.repositoryName}'
              },
              country: '${this.contryCode}',
              national_source: 'SITEID::${this.nationalSource}',
              repository_source: 'OPENDOAR::${this.repositorySource}'
          });`;
          this.laReferencia.nativeElement.appendChild(script);
        }
      });

  }
}