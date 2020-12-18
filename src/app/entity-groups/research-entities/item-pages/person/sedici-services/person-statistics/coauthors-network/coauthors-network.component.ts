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
        this.setGraphData();
      }
    );
  }

  private setGraphData(): void {

    const categories = [];
    var index = 0;
    const nodes = []
    this.coAuthors.nodes.forEach((node) => {
      categories[index] = {
        name: node.id,
      };
      const newNode = {
        'id': node.id,
        'name': node.name,
        'itemStyle': null,
        'symbolSize': 20,
        'value': this.coAuthors.links.filter(link => (link.target === node.id) || (link.source === node.id)).length,
        'category': index,
        // Use random x, y
        'x': null,
        'y': null,
        'draggable': true
      };
      index +=1;
      nodes.push(newNode);
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
          data: nodes,
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
