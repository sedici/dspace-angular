import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../../core/shared/item.model';


@Component({
  selector: 'ds-publication-types-chart',
  templateUrl: './publication-types-chart.component.html',
  styleUrls: ['./publication-types-chart.component.scss']
})
export class PublicationTypesChartComponent implements OnInit {

  @Input() publications:Item[];

  private pubTypes = [];

  private graphData: object;

  ngOnInit(): void {
    this.setPubTypes();
    this.setGraphData();
  }

  private setPubTypes() {
    // Extract the type of the publications
    var types = this.publications.map(
      publication => (publication.firstMetadataValue("dc.type") === undefined)?
        "Undefined" : publication.firstMetadataValue("dc.type")
    );

    // Count the amount of each type
    var types_dict = {};
    for (var pub_type of types) {
      if (types_dict[pub_type] === undefined){
        types_dict[pub_type] = 1
      }
      else{
        types_dict[pub_type] += 1
      }
    }

    // Create a dictionary with the types and the number of types
    var types_set = new Set(types);
    types_set.forEach(function(diff_types){
      this.pubTypes.push(
        {"name": diff_types , "value": types_dict[diff_types]}
      )
    }, this);

  }

  private setGraphData() {
    this.graphData = {
      title: {
        text: 'Publications per type'
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
          name: 'area',
          type: 'pie',
          radius: [30, 110],
          roseType: 'area',
          data: this.pubTypes
        }
      ]
    };
  }
}
