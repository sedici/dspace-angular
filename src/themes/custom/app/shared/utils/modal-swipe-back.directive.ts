import { Directive, HostListener, ElementRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HostWindowService, WidthCategory } from 'src/app/shared/host-window.service';
import { Observable } from 'rxjs';

@Directive({
  selector: 'div',
  standalone: true
})
export class ModalSwipeBackDirective implements OnInit {
  private startX: number;
  private swipeThreshold = -100;
  
  isMobile$: Observable<boolean>;
  isMobile = false;

  constructor(
    private el: ElementRef,
    private modalService: NgbModal,
    private windowService: HostWindowService
  ) {
    this.isMobile$ = this.windowService.isUpTo(WidthCategory.MD);
  }

  ngOnInit() {
    this.isMobile$.subscribe(isMobile => {
      this.isMobile = isMobile;
    });

    // Solo aplicar en dispositivos móviles
    if (!this.isMobile) return;
    
    // Configurar prevención de swipe back del navegador
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
      this.modalService.dismissAll();
    };
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (!this.isMobile) return;
    this.startX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (!this.isMobile) return;
    
    const endX = event.changedTouches[0].clientX;
    if (endX - this.startX < this.swipeThreshold) {
      this.modalService.dismissAll();
      event.preventDefault();
    }
  }
}