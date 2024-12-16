import {
  AsyncPipe,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbsComponent as BaseComponent } from '../../../../app/breadcrumbs/breadcrumbs.component';
import { VarDirective } from '../../../../app/shared/utils/var.directive';

import { BreadcrumbsService } from 'src/app/breadcrumbs/breadcrumbs.service';
import { Router } from '@angular/router';
/**
 * Component representing the breadcrumbs of a page
 */
@Component({
  selector: 'ds-themed-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  // templateUrl: '../../../../app/breadcrumbs/breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  // styleUrls: ['../../../../app/breadcrumbs/breadcrumbs.component.scss'],
  standalone: true,
  imports: [VarDirective, NgIf, NgTemplateOutlet, NgFor, RouterLink, NgbTooltipModule, AsyncPipe, TranslateModule],
})
export class BreadcrumbsComponent extends BaseComponent {
  isResponsive: boolean = false;
  isItemView: boolean = false;

  constructor(
    protected breadcrumbsService: BreadcrumbsService,
    private router: Router,
  ) {
    super(breadcrumbsService);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkResponsive();
  }

  ngOnInit(): void {
    this.checkResponsive();
    const currentUrl = this.router.url;
    this.isItemView = currentUrl.includes('/items/');
  }

  checkResponsive() {
    this.isResponsive = window.innerWidth < 768; // Ajusta el ancho según tus necesidades
  }
}
