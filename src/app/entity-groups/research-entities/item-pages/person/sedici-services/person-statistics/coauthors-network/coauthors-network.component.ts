import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../../core/shared/item.model';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'ds-coauthors-network',
  templateUrl: './coauthors-network.component.html',
  styleUrls: ['./coauthors-network.component.scss']
})
export class CoauthorsNetworkComponent implements OnInit {

  @Input() publications:Item[];

  private coAuthors = {
    "nodes": [],
    "links": []
  };

  private graphData: object;

  fields: string[] = [
    'dc.contributor.author',
    'dc.creator',
    'dc.contributor'
  ];

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    this.setCoauthors()
    this.setGraphData()
  }

  private setCoauthors(){
    // Extract the type of the publications
    var coauthorsLists = this.publications.map(
      publication => publication.allMetadata(this.fields)
    );
    var authors = new Set();
    for (var coauthors of coauthorsLists){
      var processed_coauthors = new Set()
      for (var coauthor of coauthors){
        var author = coauthor.value
        authors.add(author)
        processed_coauthors.add(author)
        for (var related_coauthor of coauthors){
          if (!processed_coauthors.has(related_coauthor.value)){
            this.coAuthors.links.push(
              {
                "source": author,
                "target": related_coauthor.value
              }
            )
          }
        }
      }
    }
    authors.forEach(
      author => this.coAuthors.nodes.push({
        "id": author,
        "name": author
      })
    )

  }

  private setGraphData(): void {

    const categories = [];
    var index = 0;
    this.coAuthors.nodes.forEach((node) => {
      node['itemStyle'] = null;
      node['symbolSize']  = 20;
      categories[index] = {
        name: node.id,
      };
      node['value'] = this.coAuthors.links.filter( link => (link.target === node.id) || (link.source === node.id)).length;
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
