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

  private svg;
  private margin = 150;
  private width = 450;
  private height = 450;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors;

  ngOnInit(): void {
    this.setData();
    this.createSvg();
    this.createColors();
    this.drawChart();
  }

  setData() {
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
        types_dict[pub_type] = 0
      }
      else{
        types_dict[pub_type] += 1
      }
    }

    // Create a dictionary with the types and the number of types
    var types_set = new Set(types);
    types_set.forEach(function(diff_types){
      this.data.push(
        {"Publication_type": diff_types , "Number": types_dict[diff_types]}
      )
    }, this);

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
    .range(d3.schemeDark2)
  }

  private drawChart(): void {
    // Compute the position of each group on the pie:
    const pie = d3.pie<any>().value((d: any) => Number(d.Number));

    var arc = d3.arc()
      .innerRadius(this.radius * 0.4)         // This is the size of the donut hole
      .outerRadius(this.radius * 0.8)

    // Build the pie chart
    this.svg
    .selectAll('allSlices')
    .data(pie(this.data))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => (this.colors(i)))
    .attr("stroke", "white")
    .style("stroke-width", "1px");

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
    .innerRadius(this.radius * 0.9)
    .outerRadius(this.radius * 0.9)

    // Add the polylines between chart and labels:
    this.svg
      .selectAll('allPolylines')
      .data(pie(this.data))
      .enter()
      .append('polyline')
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr('points', function(d) {
          var posA = arc.centroid(d) // line insertion in the slice
          var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
          var posC = outerArc.centroid(d); // Label position = almost the same as posB
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
          posC[0] = this.radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
          return [posA, posB, posC]
        })

    // Add the polylines between chart and labels:
    this.svg
      .selectAll('allLabels')
      .data(pie(this.data))
      .enter()
      .append('text')
        .text( function(d) { return d.data.Publication_type  } )
        .attr('transform', function(d) {
            var pos = outerArc.centroid(d);
            // var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            // pos[0] = this.radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
        })
        .style('text-anchor', function(d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
        })
        .style("font-size", 7);
  }
}
