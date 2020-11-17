import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../../core/shared/item.model';


@Component({
  selector: 'ds-publications-time-chart',
  templateUrl: './publications-time-chart.component.html',
  styleUrls: ['./publications-time-chart.component.scss']
})

export class PublicationsTimeChartComponent implements OnInit {

  @Input() publications:Item[];

  private graphData: object;

  private pubsPerTime = [];

  constructor() { }

  ngOnInit(): void {
    this.setPubPerTime();
    this.setGraphData()
  }

  private setPubPerTime() {
    var years = this.publications.map(
      publication => (publication.firstMetadataValue("dc.date.issued") === undefined)?
        undefined : publication.firstMetadataValue("dc.date.issued").split("-", 1)[0]
    ).filter( year => year);

    // Count the amount of each year
    var years_dict = {};
    for (var year of years) {
      if (years_dict[year] === undefined){
        years_dict[year] = 1
      }
      else{
        years_dict[year] += 1
      }
    }

    // Fill with 0 years that are have not publications
    var max_year = Math.max.apply(Math, years);
    var min_year = Math.min.apply(Math, years);
    for (let year = min_year + 1; year < max_year; year++) {
      if (years_dict[year] === undefined){
        years_dict[year] = 0
      }
      years.push(year)
    }
    years.sort()

    // Create a dictionary with the years and the number of publications
    var years_set = new Set(years);
    years_set.forEach(function(year){
      this.pubsPerTime.push(
        {"year": year , "value": years_dict[year]}
      )
    }, this);

  }

  private setGraphData (){
    this.graphData = {
      title: {
        text: 'Publications per time',
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
          data: this.pubsPerTime.map( x => x.year),
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [{
        type: 'value'
      }],
      series: [{
        name: 'Counters',
        type: 'bar',
        barWidth: '60%',
        data: this.pubsPerTime.map( x => x.value)
      }]
    };
  }
}
