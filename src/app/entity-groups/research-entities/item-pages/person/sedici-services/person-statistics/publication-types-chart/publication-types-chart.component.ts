import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PersonStatisticsService } from '../../person-statistics.service';


@Component({
  selector: 'ds-publication-types-chart',
  templateUrl: './publication-types-chart.component.html',
  styleUrls: ['./publication-types-chart.component.scss']
})
export class PublicationTypesChartComponent implements OnInit {

  @Input() item: Item;

  private pubTypes = [];

  private pubTypes$: Observable<any[]>;

  private graphData: object;

  constructor(private translateService: TranslateService, private personStatisticsService: PersonStatisticsService) { }

  ngOnInit(): void {
    this.setPubTypes();
  }

  private setPubTypes() {
    //Call statistics service
    this.pubTypes$ = this.personStatisticsService.getPublicationsPerType(this.item);
    this.pubTypes$.subscribe(
      (pubsArray) => {
        this.pubTypes = pubsArray;
        this.setGraphData();
      }
    );
  }

  private setGraphData() {
    this.graphData = {
      title: {
        text: this.translateService.instant('person.statistics.publicationsType.title')
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        x: 'center',
        y: 'bottom',
        data: this.pubTypes.map(data => data.name)
      },
      calculable: true,
      series: [
        {
          name: this.translateService.instant('person.statistics.publicationsType.label'),
          type: 'pie',
          radius: [30, 110],
          roseType: 'area',
          data: this.pubTypes
        }
      ]
    };
  }
}
