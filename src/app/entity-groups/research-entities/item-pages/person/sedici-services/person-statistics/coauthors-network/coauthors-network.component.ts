import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { parse } from 'echarts/extension/dataTool/gexf';


@Component({
  selector: 'ds-coauthors-network',
  templateUrl: './coauthors-network.component.html',
  styleUrls: ['./coauthors-network.component.scss']
})
export class CoauthorsNetworkComponent implements OnInit {

  options; //Observable<any>;

  data = {
    "nodes": [
      {
        "id": 1,
        "name": "Carlos"
      },
      {
        "id": 2,
        "name": "Ernesto"
      },
      {
        "id": 3,
        "name": "Gloria"
      },
      {
        "id": 4,
        "name": "Ana"
      },
      {
        "id": 5,
        "name": "Miguel"
      },
      {
        "id": 6,
        "name": "Fernando"
      },
      {
        "id": 7,
        "name": "Gonzalo"
      },
      {
        "id": 8,
        "name": "Lucia"
      },
      {
        "id": 9,
        "name": "Eliana"
      },
      {
        "id": 10,
        "name": "Juan"
      }
    ],
    "links": [
      {
        "source": 1,
        "target": 2
      },
      {
        "source": 1,
        "target": 5
      },
      {
        "source": 1,
        "target": 6
      },
      {
        "source": 2,
        "target": 3
      },
              {
        "source": 2,
        "target": 7
      }
      ,
      {
        "source": 3,
        "target": 4
      },
       {
        "source": 8,
        "target": 3
      }
      ,
      {
        "source": 4,
        "target": 5
      }
      ,
      {
        "source": 4,
        "target": 9
      },
      {
        "source": 5,
        "target": 10
      }
    ]
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    const categories = [];
    var index = 0;
    this.data.nodes.forEach((node) => {
      node['itemStyle'] = null;
      node['symbolSize']  = 10;
      categories[index] = {
        name: node.name,
      };
      index += 1;
      //node['value'] = node['symbolSize'];
      node['category'] = index;
      // Use random x, y
      node['x'] = node['y'] = null;
      node['draggable'] = true;
    });
    this.options = {
      title: {
        text: 'CoAutores',
        subtext: '',
        top: 'bottom',
        left: 'right',
      },
      tooltip: {},
      legend: [
        {
          data: categories.map((a) => a.name),
        },
      ],
      animation: false,
      series: [
        {
          name: 'Coautores',
          type: 'graph',
          layout: 'force',
          data: this.data.nodes,
          links: this.data.links,
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
