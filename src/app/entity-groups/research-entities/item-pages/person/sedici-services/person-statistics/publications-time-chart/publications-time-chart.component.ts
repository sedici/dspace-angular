import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PersonStatisticsService } from '../../person-statistics.service';


@Component({
  selector: 'ds-publications-time-chart',
  templateUrl: './publications-time-chart.component.html',
  styleUrls: ['./publications-time-chart.component.scss']
})

export class PublicationsTimeChartComponent implements OnInit {

  @Input() item: Item;

  private graphData: object;

  private pubsPerTime$: Observable<any[]>;
  private pubsPerTime: any[];

  constructor(private translateService: TranslateService, private personStatisticsService: PersonStatisticsService) { }

  ngOnInit(): void {
    this.getPubPerTime();
  }

  private getPubPerTime() {
    // Call statistics service
    this.pubsPerTime$ = this.personStatisticsService.getPublicationsPerTime(this.item);
    this.pubsPerTime$.subscribe(
      (pubsArray) => {
        this.pubsPerTime = pubsArray;
        this.setPubsPerTime();
        this.setGraphData();
      }
    );

  }

  setPubsPerTime() {
    // Fill with 0 years that are have not publications
    const years = this.pubsPerTime.map((year_dict) => year_dict.name);
    var max_year = Math.max.apply(Math, years);
    var min_year = Math.min.apply(Math, years);
    for (let year = min_year + 1; year < max_year; year++) {
      if (!years.includes(year)) {
        this.pubsPerTime.push({
          'name': year,
          'value': 0
        })
      }
    }
    this.pubsPerTime = this.pubsPerTime.sort((year_dict1, year_dict2) => parseInt(year_dict1.name) - parseInt(year_dict2.name));

  }

  private setGraphData() {
    this.graphData = {
      title: {
        text: this.translateService.instant('person.statistics.publicationsTime.title')
      },
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: this.pubsPerTime.map(x => x.name),
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [{
        type: 'value'
      }],
      series: [{
        name: this.translateService.instant('person.statistics.publicationsTime.label'),
        type: 'bar',
        barWidth: '60%',
        data: this.pubsPerTime.map(x => x.value)
      }]
    };
  }
}
