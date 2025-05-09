import { Observable } from 'rxjs';
import { ComcolPageLogoComponent } from 'src/app/shared/comcol/comcol-page-logo/comcol-page-logo.component';
import {
  AsyncPipe,
  NgClass,
  NgIf,
  NgTemplateOutlet,
  NgForOf,
} from '@angular/common';
import {
  Component,
  Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import {
  Router,
  RouterModule,
} from '@angular/router';

@Component({
  selector: 'ds-home-slider',
  styleUrls: ['./home-slider.component.scss'],
  templateUrl: './home-slider.component.html',
  standalone: true,
  imports: [NgTemplateOutlet, NgIf,RouterModule, AsyncPipe, TranslateModule, NgClass, NgForOf, ComcolPageLogoComponent],
})
export class HomeSliderComponent {

  @Input() title: string;

  @Input() slide: boolean;

  @Input() nItems: number;

  @Input() prueba: boolean;

  @Input() items: any;

  @Input() sliderItems: SliderItem2[][];

  displayedItems: { title: string, imgUrl: Bitstream }[][] = [];

  ngOnInit(): void {
    if ((this.slide)&&(this.prueba)){
      const resultado = [];
      for (const arg of this.sliderItems){
        const resultado = [];
        arg.forEach((item, index) => {
          item.img.subscribe(imageUrl => {
            resultado[index] = {
              title: item.title,
              imgUrl: imageUrl.payload
            };
          });
        });
        this.displayedItems.push(resultado);
      }

      //for (let i = 0; i < this.sliderItems.length; i += 5) {
      //  const subarreglo = this.sliderItems.slice(i, i + 5);
      //  resultado.push(subarreglo);
      //}
      //this.items = resultado
    }
  }

}

export class SliderItem {
  title: string;
  img: string;
  description: string;
  href: string;
}

export class SliderItem2 {
  title: string;
  href: string;
  img: Observable<RemoteData<Bitstream>>;
}
