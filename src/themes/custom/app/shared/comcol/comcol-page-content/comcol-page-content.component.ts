import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnChanges,
 } from '@angular/core';
import { ComcolPageContentComponent as BaseComponent } from '../../../../../../app/shared/comcol/comcol-page-content/comcol-page-content.component';

@Component({
  selector: 'ds-themed-comcol-page-content',
  styleUrls: ['./comcol-page-content.component.scss'],
  // styleUrls: ['../../../../../../app/shared/comcol/comcol-page-content/comcol-page-content.component.scss'],
  templateUrl: './comcol-page-content.component.html',
  // templateUrl: '../../../../../../app/shared/comcol/comcol-page-content/comcol-page-content.component.html',
  imports: [
    TranslateModule,
  ],
})
export class ComcolPageContentComponent extends BaseComponent {
  /**
   * How many rems tall the collapsed block should be
   */
  collapsedHeightRem = 6;
  
  @ViewChild('contentContainer') contentContainer: ElementRef;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content']) {
      setTimeout(() => this.processTextoLibre(), 0);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.processTextoLibre(), 0);
  }

  processTextoLibre(): void {
    if (!this.contentContainer) return;
    const el = this.contentContainer.nativeElement;

    // Find only the elements with class "texto_libre" inside the rendered HTML
    const textoLibreDivs = el.querySelectorAll('.texto_libre');
    if (!textoLibreDivs || textoLibreDivs.length === 0) return;

    const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const collapsedPx = rootFont * this.collapsedHeightRem;

    textoLibreDivs.forEach((divEl: HTMLElement) => {
      // Clean up previous toggle button in case of re-rendering
      const nextEl = divEl.nextElementSibling;
      if (nextEl && nextEl.classList.contains('texto-libre-toggle')) {
        nextEl.remove();
      }

      // Briefly un-collapse to measure real height
      divEl.classList.remove('collapsed');

      if (divEl.scrollHeight > (collapsedPx + 10)) {
        divEl.classList.add('collapsed');

        const btn = document.createElement('button');
        btn.className = 'btn btn-link p-0 texto-libre-toggle expandButton';
        btn.setAttribute('type', 'button');
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('tabindex', '0');

        const icon = document.createElement('i');
        icon.className = 'fas fa-angle-down';

        const label = document.createElement('span');
        label.className = 'ms-1';
        label.textContent = 'Ver más';

        btn.appendChild(icon);
        btn.appendChild(label);

        const toggle = () => {
          const isCollapsed = divEl.classList.contains('collapsed');
          if (isCollapsed) {
            divEl.classList.remove('collapsed');
            btn.setAttribute('aria-expanded', 'true');
            btn.classList.remove('expandButton');
            btn.classList.add('collapseButton');
            icon.className = 'fas fa-angle-up';
            label.textContent = 'Ver menos';
          } else {
            divEl.classList.add('collapsed');
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('collapseButton');
            btn.classList.add('expandButton');
            icon.className = 'fas fa-angle-down';
            label.textContent = 'Ver más';
          }
        };

        btn.addEventListener('click', toggle);
        btn.addEventListener('keyup', (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') toggle();
        });

        // Insert button after the texto_libre div
        if (divEl.parentNode) {
          divEl.parentNode.insertBefore(btn, divEl.nextSibling);
        }
      }
    });
  }
}
