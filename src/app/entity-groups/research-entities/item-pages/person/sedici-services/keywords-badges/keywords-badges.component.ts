import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../../core/shared/item.model';

@Component({
  selector: 'ds-keywords-badges',
  templateUrl: './keywords-badges.component.html',
  styleUrls: ['./keywords-badges.component.scss']
})

export class KeywordsBadgesComponent implements OnInit {

  @Input() item: Item;
  @Input() metadataField: string;
  @Input() label: string;

  private keywords : string[];

  ngOnInit(): void {
    this.setKeywords()
  }

  private setKeywords(){
    this.keywords = this.item.allMetadataValues(this.metadataField);
  }

}
