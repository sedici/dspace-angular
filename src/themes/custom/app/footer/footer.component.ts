import {
  AsyncPipe,
  DatePipe,
} from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HostWindowService, WidthCategory } from 'src/app/shared/host-window.service';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';
import { OrejimeService } from 'src/app/shared/cookies/orejime.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { NotifyInfoService } from 'src/app/core/coar-notify/notify-info/notify-info.service';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackFormComponent } from '../info/feedback/feedback-form/feedback-form.component';

@Component({
  selector: 'ds-themed-footer',
  styleUrls: ['./footer.component.scss'],
  // styleUrls: ['../../../../app/footer/footer.component.scss'],
  templateUrl: './footer.component.html',
  // templateUrl: '../../../../app/footer/footer.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    TranslateModule,
  ],
})
export class FooterComponent extends BaseComponent {
  public isMobile$: Observable<boolean>;
  
  maxMobileWidth = WidthCategory.SM;

  constructor(
    protected windowService: HostWindowService,
    @Optional() public cookies: OrejimeService,
    protected authorizationService: AuthorizationDataService,
    protected notifyInfoService: NotifyInfoService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    protected modalService: NgbModal,
  ) {
    super(cookies, authorizationService, notifyInfoService, appConfig);
  }

  ngOnInit(): void {
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
  }

  openModalFeedback() {
    const modalRef = this.modalService.open(FeedbackFormComponent, {
      centered: true, // Centra el modal
    });
  }
}
