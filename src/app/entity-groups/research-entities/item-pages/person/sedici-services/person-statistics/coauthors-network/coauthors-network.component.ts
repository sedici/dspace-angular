import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../../core/shared/item.model';
import { Observable } from 'rxjs/internal/Observable';
import { TranslateService } from '@ngx-translate/core';
import { PersonStatisticsService } from '../../person-statistics.service';


@Component({
  selector: 'ds-coauthors-network',
  templateUrl: './coauthors-network.component.html',
  styleUrls: ['./coauthors-network.component.scss']
})
export class CoauthorsNetworkComponent implements OnInit {

  @Input() item: Item;

  private coAuthors = {
    "nodes": [],
    "links": []
  };

  private coAuthors$: Observable<any[]>;

  private graphData: object;

  constructor(private translateService: TranslateService, private personStatisticsService: PersonStatisticsService) { }

  ngOnInit(): void {
    this.setCoauthors()
  }

  private setCoauthors() {
    // call statistics service
    this.coAuthors$ = this.personStatisticsService.getCoauthorsNetwork(this.item);
    this.coAuthors$.subscribe(
      (coauthorsData) => {
        this.coAuthors = coauthorsData[0];
        console.log(this.coAuthors);
        this.setGraphData();
      }
    );
  }

  private setGraphData(): void {

    const categories = [];
    var index = 0;
    this.coAuthors.nodes.forEach((node) => {
      node['itemStyle'] = null;
      node['symbolSize'] = 20;
      categories[index] = {
        name: node.id,
      };
      node['value'] = this.coAuthors.links.filter(link => (link.target === node.id) || (link.source === node.id)).length;
      node['category'] = index;
      index += 1;
      // Use random x, y
      node['x'] = node['y'] = null;
      node['draggable'] = true;
    });
    this.graphData = {
      title: {
        text: this.translateService.instant('person.statistics.coauthors.title')
      },
      tooltip: {},
      legend: [
        {
          data: categories.map((a) => a.name),
          x: 'center',
          y: 'bottom'
        },
      ],
      animation: false,
      series: [
        {
          name: this.translateService.instant('person.statistics.coauthors.label'),
          type: 'graph',
          layout: 'force',
          data: this.coAuthors.nodes,
          links: this.coAuthors.links,
          categories,
          roam: true,
          label: {
            normal: {
              position: 'right',
            },
          },
          force: {
            repulsion: 100,
          },
        },
      ],
    };
  }
}
