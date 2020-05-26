import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSediciComponent } from './header-sedici.component';

describe('HeaderSediciComponent', () => {
  let component: HeaderSediciComponent;
  let fixture: ComponentFixture<HeaderSediciComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderSediciComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSediciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
