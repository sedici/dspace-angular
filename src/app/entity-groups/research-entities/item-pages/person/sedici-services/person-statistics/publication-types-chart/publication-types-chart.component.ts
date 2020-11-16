import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../../core/shared/item.model';
import * as d3 from 'd3';

@Component({
  selector: 'ds-publication-types-chart',
  templateUrl: './publication-types-chart.component.html',
  styleUrls: ['./publication-types-chart.component.scss']
})
export class PublicationTypesChartComponent implements OnInit {

  @Input() publications:Item[];

  private data = [];

  ngOnInit(): void {
    this.setData()
  }

  private setData() {
    // Extract the type of the publications
    var types = this.publications.map(
      publication => (publication.firstMetadataValue("dc.type") === undefined)?
        "Undefined" : publication.firstMetadataValue("dc.type")
    );

    // Count the amount of each type
    var types_dict = {};
    for (var type_index in types) {
      var pub_type = types[type_index]
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
      this.data.push(
        {"name": diff_types , "value": types_dict[diff_types]}
      )
    }, this);

  }

  private options = {
    title: {
      text: 'Publications per type',
      subtext: '',
      x: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      x: 'center',
      y: 'bottom',
      data: this.data.map(data => data.name)
    },
    calculable: true,
    series: [
      {
        name: 'area',
        type: 'pie',
        radius: [30, 110],
        roseType: 'area',
        data: this.data
      }
    ]
  };
}
