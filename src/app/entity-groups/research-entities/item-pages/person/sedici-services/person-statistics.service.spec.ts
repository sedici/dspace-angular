import { TestBed } from '@angular/core/testing';

import { PersonStatisticsService } from './person-statistics.service';

describe('PersonStatisticsService', () => {
  let service: PersonStatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonStatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
