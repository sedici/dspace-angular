import { NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { filter, map, take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommunityDataService } from 'src/app/core/data/community-data.service';
import { TranslateModule } from '@ngx-translate/core';

interface ExploracionDestacada {
  title: string;
  img: string;
  href: string;
  description?: string;
}

@Component({
  selector: 'simple-carousel',
  styleUrls: ['./simple-carousel.component.scss'],
  templateUrl: './simple-carousel.component.html',
  standalone: true,
  imports: [NgTemplateOutlet, NgClass],
})
export class SimpleCarouselComponent implements OnInit {
  
  public isCarouselAtStart: boolean = true;
  public isCarouselAtEnd: boolean = false;
  public carouselPage: number = 0;
  public totalCarouselPages: number = 1;
  private itemsPerPage: number = 6;
  public defaultColor: string = '#cccccc';

  @Input() coleccionesDestacadas: Array<ExploracionDestacada> = [];

  constructor(
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const totalItems = this.coleccionesDestacadas.length;
    this.totalCarouselPages = Math.ceil(totalItems / this.itemsPerPage);
    this.carouselPage = 0;
    this.isCarouselAtStart = true;
    this.isCarouselAtEnd = this.totalCarouselPages <= 1;
  }



  public scrollGrid(container: HTMLElement, direction: 'left' | 'right'): void {
    if (direction === 'right') {
      if (this.carouselPage < (this.totalCarouselPages - 1)) {
        this.carouselPage++;
      }
    } else {
      if (this.carouselPage > 0) {
        this.carouselPage--;
      }
    }

    let targetScrollLeft = 0;

    if (this.carouselPage === (this.totalCarouselPages - 1)) {
      targetScrollLeft = container.scrollWidth - container.clientWidth;
    } else {
      const items = container.children;
      
      if (items.length > 0) {
        const firstItem = items[0] as HTMLElement;
        const secondItem = items[1] as HTMLElement;
        const itemWidth = firstItem.offsetWidth;
        const gap = secondItem ? secondItem.offsetLeft - (firstItem.offsetLeft + itemWidth) : 0;
        const itemsToScroll = this.carouselPage * this.itemsPerPage;
        targetScrollLeft = itemsToScroll * (itemWidth + gap);
      }
    }

    container.scrollTo({ 
      left: targetScrollLeft, 
      behavior: 'smooth' 
    });
  }

  public onCarouselScroll(container: HTMLElement): void {
    const { scrollLeft, clientWidth, scrollWidth } = container;
    const threshold = 10; 

    this.isCarouselAtStart = scrollLeft < threshold;
    this.isCarouselAtEnd = (scrollLeft + clientWidth) >= (scrollWidth - threshold);

    if (this.isCarouselAtEnd) {
      this.carouselPage = this.totalCarouselPages - 1;
    } else {
      this.carouselPage = Math.round(scrollLeft / clientWidth);
    }
    
    this.cdr.detectChanges();
  }

}