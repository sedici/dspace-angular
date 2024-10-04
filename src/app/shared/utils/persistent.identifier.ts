import { MetadataValue } from 'src/app/core/shared/metadata.models';
import { Item } from 'src/app/core/shared/item.model';

// Métodos para obtener los valores de url y urn de ['dc.identifier.uri', 'sedici.identifier.other']
export function extractSuffix(identifier: string, prefixes: string[]): string {
  for (const prefix of prefixes) {
    const index = identifier.indexOf(prefix);
    if (index !== -1) {
      return identifier.substring(index + prefix.length).trim();
    }
  }
  return identifier;
}

export function setUrl(urlBase: string, suffix: string): string {
  return urlBase + suffix;
}

export function setPersistentIdentifiers(object: Item, identifierOtherMetadataName: string[]): { mdValue: MetadataValue, label: string, url: string }[] {
  let itemIdentifiers = [];
  object.allMetadata(identifierOtherMetadataName).forEach(
    (mdValue, index) => {
      const identifierValue = mdValue.value.toLowerCase();
      let label = '';
      let url = '';
      let urn = '';
      let urlBase = '';

      if (identifierValue.includes('doi') || identifierValue.startsWith('10.')) {
        label = 'DOI';
        urn = extractSuffix(mdValue.value, ['https://doi.org/', 'http://dx.doi.org/', 'doi:', 'DOI:']);
        urlBase = 'https://doi.org/';
      } else if (identifierValue.includes('hdl') || identifierValue.includes('handle')) {
        label = 'HDL';
        urn = extractSuffix(mdValue.value, ['http://hdl.handle.net/', 'hdl:', '/handle/']);
        urlBase = 'http://hdl.handle.net/';
      } else if (identifierValue.includes('arxiv')) {
        label = 'arXiv';
        urn = extractSuffix(mdValue.value, ['/arxiv.org/abs/', '/arxiv.org/pdf/', '/archive.org/details/arxiv-', 'arxiv:', 'arXiv:']);
        urlBase = 'https://arxiv.org/abs/';
      } else if (identifierValue.includes('pmcid') || identifierValue.includes('pmid')) {
        label = 'PubMed';
        urn = extractSuffix(mdValue.value, ['pmid:', 'pmcid:']);
        urlBase = urn.startsWith('PMC') ? 'https://www.ncbi.nlm.nih.gov/pmc/articles/' : 'https://pubmed.ncbi.nlm.nih.gov/';
      } else if (identifierValue.includes('ark')) {
        label = 'ARK';
        urn = extractSuffix(mdValue.value, ['ark:']);
        urlBase = 'https://n2t.net/ark:/'; // VER
      } else {
        return;
      }
      
      if (identifierValue.startsWith('http')) {
        url = identifierValue;
      } else {
        url = setUrl(urlBase, urn);
      }

      const identifierListLength = itemIdentifiers.push({
        mdValue: new MetadataValue(),
        label: label,
        url: url,
      });
      itemIdentifiers[identifierListLength - 1].mdValue.value = urn;
    }
  );
  return itemIdentifiers;
}