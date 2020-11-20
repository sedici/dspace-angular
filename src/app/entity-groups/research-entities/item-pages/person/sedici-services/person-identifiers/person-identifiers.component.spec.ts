import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonIdentifiersComponent } from './person-identifiers.component';

describe('PersonIdentifiersComponent', () => {
  let component: PersonIdentifiersComponent;
  let fixture: ComponentFixture<PersonIdentifiersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonIdentifiersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonIdentifiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
