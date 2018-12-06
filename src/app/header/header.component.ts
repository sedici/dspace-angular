import { Component } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { MenuService } from '../shared/menu/menu.service';
import { MenuID } from '../shared/menu/initial-menus-state';

@Component({
  selector: 'ds-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
})
export class HeaderComponent {
  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated: Observable<boolean>;
  public showAuth = false;
  menuID = MenuID.PUBLIC;

  constructor(
    private menuService: MenuService
  ) {
  }

  public toggleNavbar(): void {
    this.menuService.toggleMenu(this.menuID);
  }
}
