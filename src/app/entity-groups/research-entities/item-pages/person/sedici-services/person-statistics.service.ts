import { Observable } from 'rxjs';
import { map, find, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { RequestService } from 'src/app/core/data/request.service';
import { GetRequest } from 'src/app/core/data/request.models';;
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';
import { Item } from 'src/app/core/shared/item.model';
import {
  filterSuccessfulResponses
} from 'src/app/core/shared/operators';
import { hasValue } from 'src/app/shared/empty.util';
import { GenericSuccessResponse } from 'src/app/core/cache/response.models';
import { PersonStatisticsResponseParsingServiceService } from './person-statistics-response-parsing-service.service';
import { GenericConstructor } from 'src/app/core/shared/generic-constructor';
import { ResponseParsingService } from 'src/app/core/data/parsing.service';

@Injectable({
  providedIn: 'root'
})

export class PersonStatisticsService {

  protected basePath = 'statistics/persons/';


  constructor(
    private requestService: RequestService,
    private halService: HALEndpointService) {
  }

  public getPersonStatisticEndpoint(personId: string, statisticType: string): Observable<string> {
    return this.halService.getEndpoint(this.basePath).pipe(
      map((endpoint: string) => `${endpoint}/${personId}/${statisticType}`)
    );
  }

  getPublicationsPerTime(person: Item) {
    return this.getPersonStatistic(person.uuid, 'publicationstime')
  }

  getPublicationsPerType(person: Item) {
    return this.getPersonStatistic(person.uuid, 'publicationstype')
  }

  getCoauthorsNetwork(person: Item) {
    return this.getPersonStatistic(person.uuid, 'coauthors')
  }

  public getPersonStatistic(personId: string, statisticType: string): Observable<any[]> {
    const hrefObs = this.getPersonStatisticEndpoint(personId, statisticType);
    const requestId = this.requestService.generateRequestId();

    hrefObs.pipe(
      find((href: string) => hasValue(href)),
      map((href: string) => {
        const request = new GetRequest(requestId, href);
        Object.assign(request, {
          getResponseParser(): GenericConstructor<ResponseParsingService> {
            return PersonStatisticsResponseParsingServiceService;
          }
        });
        this.requestService.configure(request);
      })
    ).subscribe();
    return this.requestService.getByUUID(requestId).pipe(
      filterSuccessfulResponses(),
      map((restResponse: GenericSuccessResponse<any[]>) => {
        return Object.assign(new Array(), restResponse.payload['data']);
      }),
      take(1),
    );
  }
}
