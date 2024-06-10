import {
  Inject,
  Injectable,
} from '@angular/core';
import {
  Meta,
  MetaDefinition,
  Title,
} from '@angular/platform-browser';
import {
  Router,
} from '@angular/router';
import {
  Store,
} from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
  
import {
  APP_CONFIG,
  AppConfig,
} from '../../../config/app-config.interface';
import { DSONameService } from '../breadcrumbs/dso-name.service';
import { CoreState } from '../core-state.model';
import { BundleDataService } from '../data/bundle-data.service';
import { AuthorizationDataService } from '../data/feature-authorization/authorization-data.service';
import { RootDataService } from '../data/root-data.service';
import { HardRedirectService } from '../services/hard-redirect.service';
import { HeadTagService } from './head-tag.service';
import { Item } from '../shared/item.model';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteDataPayload } from '../shared/operators';
import { Bundle } from '../shared/bundle.model';
import { map, switchMap, take, of as observableOf, concat as observableConcat, mergeMap, filter, EMPTY, Observable } from 'rxjs';
import { Bitstream } from '../shared/bitstream.model';
import { RemoteData } from '../data/remote-data';
import { hasValue, isNotEmpty } from 'src/app/shared/empty.util';
import { getDownloadableBitstream } from '../shared/bitstream.operators';
import { getBitstreamRoute } from 'src/app/app-routing-paths';
import { PaginatedList } from '../data/paginated-list.model';
import { URLCombiner } from '../url-combiner/url-combiner';
import { BitstreamFormat } from '../shared/bitstream-format.model';
import { MetadataValue } from '../shared/metadata.models';
import { LinkDefinition } from '../services/link-head.service';
import { LinkHeadService } from '../services/link-head.service';

@Injectable({
  providedIn: 'root',
})
export class HeadTagSEDICIService extends HeadTagService {
  
  constructor(
    protected router: Router,
    protected translate: TranslateService,
    protected meta: Meta,
    protected title: Title,
    protected dsoNameService: DSONameService,
    protected bundleDataService: BundleDataService,
    protected rootService: RootDataService,
    protected store: Store<CoreState>,
    protected hardRedirectService: HardRedirectService,
    @Inject(APP_CONFIG) protected appConfig: AppConfig,
    protected authorizationService: AuthorizationDataService,
    protected linkService: LinkHeadService
  ) {
    super(router, translate, meta, title, dsoNameService, bundleDataService, rootService, store, hardRedirectService, appConfig, authorizationService);
  }

  protected setDSOMetaTags(): void {

    let link: LinkDefinition = { rel:"schema.DCTERMS", href:"http://purl.org/dc/terms/" };
    this.linkService.addTag(link);
    link = { rel:"schema.DC", href:"http://purl.org/dc/elements/1.1/" };
    this.linkService.addTag(link);

    this.setIdentifierURITags();
    this.setIdentifierTags();
    this.setTitleTags();
    this.setTitleAlternativeTags();
    this.setCreatorTags();
    this.setIssuedTags();
    this.setAvailableTags();
    this.setCreatedTags();
    this.setAbstractTags();
    this.setDescriptionTags();
    this.setFormatTags();
    this.setExtentTags();
    this.setLanguageTags();
    this.setSubjectTags();
    this.setTypeTags();
    this.setLicenseTags();
    this.setRightsTags();
    this.setProvenanceTags();
    this.setContributorTags();
    this.setIsVersionOfTags();
    this.setPublisherTags();
    this.setDateTags();
    this.setRelationTags();
    this.setSourceTags();
    this.setIsPartOfTags();

    super.setDSOMetaTags();
    if (this.isDissertation()) {
      this.setCitationDissertationInstitutionTag();
    }
    if (this.isTechReport()) {
      this.setCitationTechnicalReportInstitutionTag();
    }
    this.setCitationDOITag();
    this.setCitationJournalTitleTag();
    this.setCitationVolumeAndIssueTag();
    this.setCitationConferenceTitleTag();
    this.setCitationOnlineDateTag();

    /**
     * Consideraciones:
      this.setCitationPdfUrlTag(); // PARCHE PDF

      this.setTitleTag(); y this.setDescriptionTag(); // NO DEBERÍAN LLAMARSE
     */
  }

  // CITATION TAGS

  /**
   * Add <meta name="citation_title" ... >  to the <head>
   */
  protected setCitationTitleTag(): void {
    const value = this.getMetaTagValue('dc.title');
    this.addMetaTag('citation_title', value);
  }

  protected setCitationAuthorTags(): void {
    const values: string[] = this.getMetaTagValues(['sedici.creator.person', 'sedici.creator.corporate', 'sedici.contributor.compiler', 'sedici.creator.interprete', 'sedici.contributor.editor']);
    this.addMetaTags('citation_author', values);
  }

  protected setCitationPublicationDateTag(): void {
    const value = this.getFirstMetaTagValue(['dc.date.issued', 'sedici.date.exposure', 'dc.date.created']);
    this.addMetaTag('citation_publication_date', value);
  }

  protected setCitationISSNTag(): void {
    const value = this.getMetaTagValue('sedici.identifier.issn');
    this.addMetaTag('citation_issn', value);
  }

  protected setCitationISBNTag(): void {
    const value = this.getMetaTagValue('sedici.identifier.isbn');
    this.addMetaTag('citation_isbn', value);
  }

  /**
   * Add <meta name="citation_dissertation_institution" ... >  to the <head>
   */
  protected setCitationDissertationInstitutionTag(): void {
    const value = this.getMetaTagValue('thesis.degree.grantor');
    this.addMetaTag('citation_dissertation_institution', value);
  }

  /**
   * Add <meta name="citation_technical_report_institution" ... >  to the <head>
   */
  protected setCitationTechnicalReportInstitutionTag(): void {
    const value = this.getFirstMetaTagValue(['dc.publisher', 'mods.originInfo.place']);
    this.addMetaTag('citation_technical_report_institution', value);
  }

  /**
   * Add dc.publisher to the <head>. The tag name depends on the item type.
   */
  protected setCitationPublisherTag(): void {
    const value = this.getMetaTagValue('dc.publisher');
    this.addMetaTag('citation_publisher', value);
  }

  protected setCitationKeywordsTag(): void {
    const value = this.getMultipleMetaTagValuesAndCombine(['dc.subject', 'sedici.subject.materias']);
    this.addMetaTag('citation_keywords', value);
  }

  // PARCHE PDF
  // setCitationPdfUrlTag(): void {
  //   if (this.currentObject.value instanceof Item) {
  //     const item = this.currentObject.value as Item;

  //     // Retrieve the ORIGINAL bundle for the item
  //     this.bundleDataService.findByItemAndName(
  //       item,
  //       'ORIGINAL',
  //       true,
  //       true,
  //       followLink('primaryBitstream'),
  //       followLink('bitstreams', {
  //         findListOptions: {
  //           // limit the number of bitstreams used to find the citation pdf url to the number
  //           // shown by default on an item page
  //           elementsPerPage: this.appConfig.item.bitstream.pageSize,
  //         },
  //       }, followLink('format')),
  //     ).pipe(
  //       getFirstSucceededRemoteDataPayload(),
  //       switchMap((bundle: Bundle) =>
  //         // First try the primary bitstream
  //         bundle.primaryBitstream.pipe(
  //           getFirstCompletedRemoteData(),
  //           map((rd: RemoteData<Bitstream>) => {
  //             if (hasValue(rd.payload)) {
  //               return rd.payload;
  //             } else {
  //               return null;
  //             }
  //           }),
  //           getDownloadableBitstream(this.authorizationService),
  //           // return the bundle as well so we can use it again if there's no primary bitstream
  //           map((bitstream: Bitstream) => [bundle, bitstream]),
  //         ),
  //       ),
  //       switchMap(([bundle, primaryBitstream]: [Bundle, Bitstream]) => {
  //         if (hasValue(primaryBitstream)) {
  //           // If there was a downloadable primary bitstream, emit its link
  //           return getBitstreamRoute(item, primaryBitstream);
  //         } else {
  //           // Otherwise consider the regular bitstreams in the bundle
  //           return bundle.bitstreams.pipe(
  //             getFirstCompletedRemoteData(),
  //             switchMap((bitstreamRd: RemoteData<PaginatedList<Bitstream>>) => {
  //               if (hasValue(bitstreamRd.payload) && bitstreamRd.payload.totalElements === 1) {
  //                 // If there's only one bitstream in the bundle, emit its link if its downloadable
  //                 return this.getBitLinkIfDownloadable(bitstreamRd.payload.page[0], bitstreamRd);
  //               } else {
  //                 // Otherwise check all bitstreams to see if one matches the format whitelist
  //                 return this.getFirstAllowedFormatBitstreamLink(bitstreamRd);
  //               }
  //             }),
  //           );
  //         }
  //       }),
  //       take(1),
  //     ).subscribe((link: string) => {
  //       // Use the found link to set the <meta> tag
  //       this.addMetaTag(
  //         'citation_pdf_url',
  //         new URLCombiner(this.hardRedirectService.getCurrentOrigin(), link).toString(),
  //       );
  //     });
  //   }
  // }

  // getBitLinkIfDownloadable(bitstream: Bitstream, bitstreamRd: RemoteData<PaginatedList<Bitstream>>): Observable<string> {
  //   return observableOf(bitstream).pipe(
  //     getDownloadableBitstream(this.authorizationService),
  //     switchMap((bit: Bitstream) => {
  //       if (hasValue(bit)) {
  //         const item = this.currentObject.value as Item;
  //         return getBitstreamRoute(item, bit);
  //       } else {
  //         // Otherwise check all bitstreams to see if one matches the format whitelist
  //         return this.getFirstAllowedFormatBitstreamLink(bitstreamRd);
  //       }
  //     }),
  //   );
  // }

  // protected getFirstAllowedFormatBitstreamLink(bitstreamRd: RemoteData<PaginatedList<Bitstream>>): Observable<string> {
  //   const item = this.currentObject.value as Item;
  //   if (hasValue(bitstreamRd.payload) && isNotEmpty(bitstreamRd.payload.page)) {
  //     // Retrieve the formats of all bitstreams in the page sequentially
  //     return observableConcat(
  //       ...bitstreamRd.payload.page.map((bitstream: Bitstream) => bitstream.format.pipe(
  //         getFirstSucceededRemoteDataPayload(),
  //         // Keep the original bitstream, because it, not the format, is what we'll need
  //         // for the link at the end
  //         map((format: BitstreamFormat) => [bitstream, format]),
  //       )),
  //     ).pipe(
  //       // Verify that the bitstream is downloadable
  //       mergeMap(([bitstream, format]: [Bitstream, BitstreamFormat]) => observableOf(bitstream).pipe(
  //         getDownloadableBitstream(this.authorizationService),
  //         map((bit: Bitstream) => [bit, format]),
  //       )),
  //       // Filter out only pairs with whitelisted formats and non-null bitstreams, null from download check
  //       filter(([bitstream, format]: [Bitstream, BitstreamFormat]) =>
  //         hasValue(format) && hasValue(bitstream) && this.CITATION_PDF_URL_MIMETYPES.includes(format.mimetype)),
  //       // We only need 1
  //       take(1),
  //       // Emit the link of the match
  //       // tap((v) => console.log('result', v)),
  //       mergeMap(([bitstream ]: [Bitstream, BitstreamFormat]) => getBitstreamRoute(item, bitstream)),
  //     );
  //   } else {
  //     return EMPTY;
  //   }
  // }

  /**
   * Add <meta name="citation_conference_title" ... >  to the <head>
   */
  protected setCitationConferenceTitleTag(): void {
    const value = this.getMetaTagValue('sedici.relation.event');
    this.addMetaTag('citation_conference_title', value);
  }

  /**
   * Add <meta name="citation_online_date" ... >  to the <head>
   */
  protected setCitationOnlineDateTag(): void {
    const value = this.getMetaTagValue('dc.date.available');
    this.addMetaTag('citation_online_date', value);
  }

  /**
   * Add <meta name="citation_journal_title" ... >  to the <head>
   */
  protected setCitationJournalTitleTag(): void {
    const value = this.getMetaTagValue('sedici.relation.journalTitle');
    this.addMetaTag('citation_journal_title', value);
  }

  /**
   * Add <meta name="citation_volume" ... >  to the <head>
   */
  protected setCitationVolumeAndIssueTag(): void {
    const value = this.getMetaTagValue('sedici.relation.journalVolumeAndIssue');
    this.addMetaTag('citation_volume', value);
  }

  /**
   * Add <meta name="citation_doi" ... >  to the <head>
   */
  protected setCitationDOITag(): void {
    const value = this.getMetaTagValue('sedici.identifier.doi');
    this.addMetaTag('citation_doi', value);
  }
  
  protected hasSubtype(value: string): boolean {
    return this.currentObject.value.hasMetadata('sedici.subtype', { value: value, ignoreCase: true });
  }
  
  protected isDissertation(): boolean {
    return this.hasType('Tesis');
  }
  
  protected isTechReport(): boolean {
    return this.hasSubtype('Reporte tecnico');
  }
  
  protected getMultipleMetaTagValuesAndCombine(keys: string[]): string {
    const values = keys.reduce((acc, key) => acc.concat(this.getMetaTagValues([key])), []);
    return values.join('; ');
  }

  // DC/DCTERMS TAGS

  protected setIdentifierURITags(): void {
    this.setMetaTags('DC.identifier', ['sedici.identifier.uri', 'dc.identifier.uri'], 'DCTERMS.URI');
  }
  
  protected setIdentifierTags(): void {
    this.setMetaTags('DC.identifier', ['sedici.identifier.doi', 'sedici.identifier.other', 'sedici.identifier.isbn', 'sedici.identifier.issn', 'sedici.identifier.expediente']);
  }

  protected setTitleTags(): void {
    this.setMetaTags('DC.title', ['dc.title']);
  }

  protected setTitleAlternativeTags(): void {
    this.setMetaTags('DCTERMS.alternative', ['dc.title.alternative', 'sedici.title.subtitle']);
  }

  protected setCreatorTags(): void {
    this.setMetaTags('DC.creator', ['sedici.creator.person', 'sedici.creator.corporate', 'sedici.contributor.editor', 'sedici.contributor.compiler']);
  }

  protected setIssuedTags(): void {
    this.setMetaTags('DCTERMS.issued', ['dc.date.issued'], 'DCTERMS.W3CDTF');
  }

  protected setAvailableTags(): void {
    this.setMetaTags('DCTERMS.available', ['dc.date.available'], 'DCTERMS.W3CDTF');
  }

  protected setCreatedTags(): void {
    this.setMetaTags('DCTERMS.created', ['dc.date.accessioned'], 'DCTERMS.W3CDTF');
  }

  protected setAbstractTags(): void {
    this.setMetaTags('DCTERMS.abstract', ['dc.description.abstract']);
  }

  protected setDescriptionTags(): void {
    this.setMetaTags('DC.description', ['sedici.description.note']);
  }

  protected setFormatTags(): void {
    this.setMetaTags('DC.format', ['dc.format', 'dc.format.medium']);
  }

  protected setExtentTags(): void {
    this.setMetaTags('DCTERMS.extent', ['dc.format.extent']);
  }

  protected setLanguageTags(): void {
    this.setMetaTags('DC.language', ['dc.language'], 'DCTERMS.RFC1766');
  }

  protected setSubjectTags(): void {
    this.setMetaTags('DC.subject', ['dc.subject', 'sedici.subject.materias']);
  }

  protected setTypeTags(): void {
    const meta = this.getMetaTag(['dc.type', 'sedici.subtype']);
    this.setMetaTags('DC.type', ['dc.type', 'sedici.subtype']);
  }

  protected setLicenseTags(): void {
    this.setMetaTags('DCTERMS.license', ['sedici.rights.license']);
  }

  protected setRightsTags(): void {
    this.setMetaTags('DC.rights', ['sedici.rights.uri'], 'DCTERMS.URI');
  }

  protected setProvenanceTags(): void {
    this.setMetaTags('DCTERMS.provenance', ['dc.description.provenance']);
  }

  protected setContributorTags(): void {
    this.setMetaTags('DC.contributor', ['sedici.contributor.director', 'sedici.contributor.codirector', 'sedici.contributor.colaborator', 'sedici.contributor.translator', 'sedici.contributor.juror', 'sedici.contributor.inscriber']);
  }

  protected setIsVersionOfTags(): void {
    this.setMetaTags('DCTERMS.isVersionOf', ['dc.relation.isVersionOf']);
  }

  protected setPublisherTags(): void {
    this.setMetaTags('DC.publisher', ['dc.publisher']);
  }

  protected setDateTags(): void {
    this.setMetaTags('DC.date', ['sedici.date.exposure']);
  }

  protected setRelationTags(): void {
    this.setMetaTags('DC.relation', ['dc.relation']);
  }

  protected setSourceTags(): void {
    this.setMetaTags('DC.source', ['dc.source']);
  }

  protected setIsPartOfTags(): void {
    this.setMetaTags('DCTERMS.isPartOf', ['sedici.relation.event', 'dc.relation.ispartof', 'sedici.relation.journalTitle', 'sedici.relation.journalVolumeAndIssue']);
  }

  protected setMetaTags(name: string, keys: string[], scheme?: string): void {
    const meta = this.getMetaTag(keys);
    const values = meta.map((m) => m.value);
    const langs = meta.map((m) => m.language);
    this.addMetaTagsWithSchemeAndLang(name, values, langs, scheme);
  }
  
  protected getMetaTag(keys: string[]): MetadataValue[] {
    return this.currentObject.value.allMetadata(keys);
  }

  protected addMetaTagWithSchemeAndLang(name: string, content: string, lang?: string, scheme?: string): void {
    if (content) {
      const tag: MetaDefinition = { name, content };
  
      if (lang) {
        tag['xml:lang'] = lang;
        tag['lang'] = lang;
      }

      if (scheme) {
        tag['scheme'] = scheme;
      }
  
      this.meta.addTag(tag);
      this.storeTag(name);
    }
  }

  protected addMetaTagsWithSchemeAndLang(name: string, content: string[], lang?: string[], scheme?: string): void {
    for (let i = 0; i < content.length; i++) {
      this.addMetaTagWithSchemeAndLang(name, content[i], lang ? lang[i] : undefined, scheme);
    }
  }

  
}