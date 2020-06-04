import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimedTaskActionsSelectCollectionComponent } from './select-collection.component';

describe('ClaimedTaskActionsSelectCollectionComponent', () => {
  let component: ClaimedTaskActionsSelectCollectionComponent;
  let fixture: ComponentFixture<ClaimedTaskActionsSelectCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimedTaskActionsSelectCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimedTaskActionsSelectCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
