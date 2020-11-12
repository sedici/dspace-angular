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

  private data2 = [];

  private data = [
     {"Publication_type": "Article", "Number": "129"},
     {"Publication_type": "Dataset", "Number": "18"},
     {"Publication_type": "Thesis", "Number": "1"},
     {"Publication_type": "Conference object", "Number": "15"},
     {"Publication_type": "Image", "Number": "2"},
   ];
  private svg;
  private margin = 20;
  private width = 350;
  private height = 200;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;

  ngOnInit(): void {
    //this.setData();
    this.createSvg();
    this.createColors();
    this.drawChart();
  }

  setData() {
    var types = this.publications.map(
      publication => (publication.firstMetadataValue("dc.type") === undefined)?
        undefined : publication.firstMetadataValue("dc.type")
    )
    var types_dict = {};
    for (var pub_type in types) {
      if (types_dict[pub_type] === undefined){
        types_dict[pub_type] = 0
      }
      else{
        types_dict[pub_type] += 1
      }
    }
    var types_set = new Set(types);
    for (var diff_types in types_set){
      this.data2.push(
        {"Publication_type": diff_types , "Number": types_dict[diff_types]}
      )
    }
    console.log(this.data2)

  }
  private createSvg(): void {
    this.svg = d3.select("figure#pie")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.width / 2 + "," + this.height / 2 + ")"
    );
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal()
    .domain(this.data.map(d => d.Number.toString()))
    .range(["#c7d3ec", "#a5b8db", "#879cc4", "#677795", "#5a6782"]);
  }

  private drawChart(): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.Number));

    // Build the pie chart
    this.svg
    .selectAll('pieces')
    .data(pie(this.data))
    .enter()
    .append('path')
    .attr('d', d3.arc()
      .innerRadius(10)
      .outerRadius(this.radius)
    )
    .attr('fill', (d, i) => (this.colors(i)))
    .attr("stroke", "#121926")
    .style("stroke-width", "1px");

    // Add labels
    const labelLocation = d3.arc()
    .innerRadius(150)
    .outerRadius(this.radius);

    this.svg
    .selectAll('pieces')
    .data(pie(this.data))
    .enter()
    .append('text')
    .text(d => d.data.Publication_type + " " + d.data.Number)
    .attr("transform", d => "translate(" + labelLocation.centroid(d) + ")")
    .style("text-anchor", "middle")
    .style("font-size", 9);

  }
}
