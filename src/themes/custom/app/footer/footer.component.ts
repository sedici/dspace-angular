import {
  AsyncPipe,
  DatePipe,
  NgIf,
} from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HostWindowService, WidthCategory } from 'src/app/shared/host-window.service';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';
import { KlaroService } from 'src/app/shared/cookies/klaro.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { NotifyInfoService } from 'src/app/core/coar-notify/notify-info/notify-info.service';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';

@Component({
  selector: 'ds-themed-footer',
  styleUrls: ['./footer.component.scss'],
  // styleUrls: ['../../../../app/footer/footer.component.scss'],
  templateUrl: './footer.component.html',
  // templateUrl: '../../../../app/footer/footer.component.html',
  standalone: true,
  imports: [NgIf, RouterLink, AsyncPipe, DatePipe, TranslateModule],
})
export class FooterComponent extends BaseComponent {
  public isMobile$: Observable<boolean>;
  
  maxMobileWidth = WidthCategory.SM;

  constructor(
    protected windowService: HostWindowService,
    @Optional() public cookies: KlaroService,
    protected authorizationService: AuthorizationDataService,
    protected notifyInfoService: NotifyInfoService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig
  ) {
    super(cookies, authorizationService, notifyInfoService, appConfig);
  }

  ngOnInit(): void {
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
  }
}
