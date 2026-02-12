import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HostWindowService, WidthCategory } from 'src/app/shared/host-window.service';

@Component({
  selector: 'sedici-post-footer',
  styleUrls: ['./sedici-post-footer.component.scss'],
  templateUrl: './sedici-post-footer.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    TranslateModule,
  ],
})
export class SediciPostFooterComponent {
  public isMobile$: Observable<boolean>;
  
  maxMobileWidth = WidthCategory.SM;

  constructor(
    protected windowService: HostWindowService,
  ) {}

  ngOnInit(): void {
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
  }
}
