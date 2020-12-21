import {Component, OnInit, ElementRef, ViewChild, Input} from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import {Item} from 'src/app/core/shared/item.model';
import {TranslateService} from '@ngx-translate/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {RelationshipService} from "../../../../../../core/data/relationship.service";
import { map } from 'rxjs/operators';

pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Component({
  selector: 'ds-person-export-profile',
  templateUrl: './person-export-profile.component.html',
  styleUrls: ['./person-export-profile.component.css']
})
export class PersonExportProfileComponent implements OnInit {

  publications$: Observable<Item[]>;
  private _identifiersMetadata = [
    {
      urlMetadata: "orcid.url",
      identifierMetadata: "identifier.orcid",
      name: "orcid"
    },
    {
      urlMetadata:"scopus-author-id.url",
      identifierMetadata: "scopus-author-id.url",
      name: "scopusid"
    },
    {
      urlMetadata: "rid.url",
      identifierMetadata: "identifier.rid",
      name: "rid"
    },
    {
      urlMetadata: "identifier.gsid",
      identifierMetadata: "identifier.gsid",
      name: "gsid"
    }
  ]

  constructor(private translateService: TranslateService, public relationshipService: RelationshipService) {


    //console.log(this.item.firstMetadata('person.birthDate'));
  }

  ngOnInit() {
    this.setPublications();
  }

  //@ViewChild('content', {static: false}) content : ElementRef;
  @Input() item: Item;

  private itemValue(key_meta,multivalue = false) {


    return (multivalue) ? this.item.allMetadataValues('person.' + key_meta).join("; ") : this.item.firstMetadata('person.' + key_meta).value;
  }

  generatePdf() {
    console.log("dale");
    console.log(this.item);
    console.log("dale");
    const documentDefinition = {
      content: [this.pdfTitle(), this.comlumns(), this.biography(),this.publications()],
      styles: this.getStylesI()
    };
    pdfMake.createPdf(documentDefinition).open();
  }

  private comlumns() {

    return {
      columns: [

        {
          type: 'none',
          ul: [
            this.printMetadataValue("lastname", "familyName"),
            this.printMetadataValue("firstname", "givenName"),
            this.printMetadataValue("email", "email", true),
            this.printMetadataValue("dni", "dni"),
            //this.printMetadataValue("cuit", "cuit"),
            this.printMetadataValue("birthdate", "birthDate"),
            this.printMetadataValue("address", "address"),
            this.printMetadataValue("telephone", "telephone"),
            this.printMetadataValue("knowslanguage", "knowsLanguage", true),
            this.printMetadataValue("keywords", "keyword", true),

          ]
        },
        [
          [{
            text: '\nIdentificadores persistentes',
            style: 'header'
          },
            this.getIdentifiers(),
          ],
          this.getWebPages(),
          [
            {
              text: '\nOrganizaciones',
              style: 'header'
            },
            this.getOrganizations(),
          ]
        ]
      ]
    };
  }


  private printMetadataValue(label, field, multivalue = false) {
    return { text: ["\n",{ text: this.translateService.instant("person.page." + label) + ": ", bold:true} , (this.item.hasMetadata("person." + field) ? this.itemValue(field,multivalue) : " -")]};
  }

  private pdfTitle() {
    return {
      text: this.itemValue('familyName') + ", " + this.itemValue('givenName') + '\n',
      style: 'header'
    };
  }

  private getStylesI() {
    return {
      header: {
        fontSize: 18,
        bold: true
      },
      subheader: {
        fontSize: 15,
        bold: true
      },
      quote: {
        italics: true
      },
      small: {
        fontSize: 8
      },
      urlstyle:{
        decoration:"underline",
        fontSize:12,
        color: 'blue',
      }
    };
  }

  private biography() {
    return this.item.hasMetadata("person.biography") ? [{
      text: this.translateService.instant("person.page.biography"),
      style: 'header'
    },
      {
        text:   this.itemValue("person.biography") ,

      }] : "";
  }

  private getIdentifiers() {
    let ids = []
    this._identifiersMetadata.forEach( metadataKeys => {
      if(this.item.hasMetadata("person." + metadataKeys.urlMetadata))
        ids.push({text: [ this.translateService.instant("person.page." + metadataKeys.name) + ": " ,
          {text: this.itemValue(metadataKeys.identifierMetadata) ,  link: metadataKeys.urlMetadata,style: 'urlstyle' }]});

    });
    return {
      type: 'none',
      ul: ids
    }
  }

  private getWebPages() {
    if (this.item.hasMetadata("person.webpage"))
      return [{
        text: '\nOtros sitios web',
        style: 'header'
      }, {text: this.printMetadataValue("webpages", "webpage") ,  link: "webpage",style: 'urlstyle' }];

  }

  private publications() {

    let array_publications = [];
    this.publications$.subscribe(val => {

      val.forEach(p => {
        array_publications.push([{text: p.firstMetadataValue("dc.title"), bold:true},this.printAuthors(p)]);

      })
    });



    return 	[{text: '\n\nPublicaciones', style: 'header'},
      {
        ol: array_publications
      }];
  }

  setPublications(){
    this.publications$ = this.relationshipService.getRelatedItemsByLabel(this.item, 'isPublicationOfAuthor').pipe(
      map(value => value.payload.page)
    );
  }
  getAuthors( publication : Item ) : Observable<Item[]>{
    return this.relationshipService.getRelatedItemsByLabel(publication, 'isAuthorOfPublication').pipe(
      map(value => value.payload.page)
    );
  }

  private printAuthors(p: Item) {
    let authors;
    this.getAuthors(p).subscribe(a => authors = a );
    let array_authors=[];
    if(authors)
      array_authors  = authors.map(a => a.firstMetadataValue("dc.contributor.author"));
    return {text: array_authors.join("; "), color:"#9b9b9b"}
    ;
  }

  private getOrganizations() {
    let organizations = this.relationshipService.getRelatedItemsByLabel(this.item, 'isOrgUnitOfPerson').pipe(
      map(value => value.payload.page)
    );
    let array_organizations = [];
    console.log(organizations);
    organizations.subscribe(val => {

      val.forEach(o => {
        array_organizations.push([{text: o.firstMetadataValue("dc.title"), bold:true}]);

      })
    });
    return array_organizations;
  }
}


