import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordsBadgesComponent } from './keywords-badges.component';

describe('KeywordsBadgesComponent', () => {
  let component: KeywordsBadgesComponent;
  let fixture: ComponentFixture<KeywordsBadgesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeywordsBadgesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeywordsBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
