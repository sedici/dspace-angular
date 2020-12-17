import { Injectable } from '@angular/core';
import { RestResponse } from 'src/app/core/cache/response.models';
import { DSpaceRESTV2Response } from 'src/app/core//dspace-rest-v2/dspace-rest-v2-response.model';
import { ResponseParsingService } from 'src/app/core/data/parsing.service';
import { RestRequest } from 'src/app/core/data/request.models';
import { GenericSuccessResponse } from 'src/app/core/cache/response.models';

@Injectable({
  providedIn: 'root'
})
export class PersonStatisticsResponseParsingServiceService implements ResponseParsingService {


  parse(request: RestRequest, data: DSpaceRESTV2Response): RestResponse {
    const payload = data.payload;

    return new GenericSuccessResponse(payload, data.statusCode, data.statusText);
  }
}
