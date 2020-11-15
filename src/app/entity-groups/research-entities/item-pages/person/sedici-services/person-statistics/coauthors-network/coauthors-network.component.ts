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

  options: Observable<any>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.options = this.http.get('https://raw.githubusercontent.com/xieziyu/ngx-echarts/master/src/assets/data/les-miserables.gexf', { responseType: 'text' }).pipe(
      map((xml) => {
        const graph = parse(xml);
        const categories = [];
        for (let i = 0; i < 9; i++) {
          categories[i] = {
            name: 'category' + i,
          };
        }
        graph.nodes.forEach((node) => {
          node.itemStyle = null;
          node.symbolSize = 10;
          node.value = node.symbolSize;
          node.category = node.attributes.modularity_class;
          // Use random x, y
          node.x = node.y = null;
          node.draggable = true;
        });
        return {
          title: {
            text: 'Les Miserables',
            subtext: 'Default layout',
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
              name: 'Les Miserables',
              type: 'graph',
              layout: 'force',
              data: graph.nodes,
              links: graph.links,
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
      }),
    );
  }
}
