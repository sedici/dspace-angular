import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonExportProfileComponent } from './person-export-profile.component';

describe('PersonExportProfileComponent', () => {
  let component: PersonExportProfileComponent;
  let fixture: ComponentFixture<PersonExportProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonExportProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonExportProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
