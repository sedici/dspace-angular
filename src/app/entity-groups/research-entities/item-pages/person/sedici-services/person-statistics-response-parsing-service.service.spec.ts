import { TestBed } from '@angular/core/testing';

import { PersonStatisticsResponseParsingServiceService } from './person-statistics-response-parsing-service.service';

describe('PersonStatisticsResponseParsingServiceService', () => {
  let service: PersonStatisticsResponseParsingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonStatisticsResponseParsingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
