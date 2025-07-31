export class MetadataConfig {
  static readonly REPEATABLE_METADATA: string[] = [
    'sedici_identifier_isbn',
    'sedici_identifier_issn',
    'sedici_identifier_other',
    'sedici_identifier_uri',
    'sedici_creator_person',
    'sedici_creator_corporate',
    'sedici_creator_interprete',
    'sedici_contributor_colaborator',
    'sedici_contributor_translator',
    'sedici_contributor_editor',
    'sedici_contributor_compiler',
    'sedici_contributor_director',
    'sedici_contributor_codirector',
    'sedici_contributor_juror',
    'sedici_contributor_inscriber',
    'dc_title_alternative',
    'dc_format',
    'dc_format_extent',
    'dc_subject',
    'sedici_subject_materias',
    'sedici_subject_ford',
    'sedici_institucionDesarrollo',
    'mods_originInfo_place',
    'mods_location',
    'sedici_relation_isRelatedWith',
    'dcterms_audience',
    'dc_coverage_spatial',
    'dc_coverage_temporal',
    'dc_description_filiation'
  ];

  static readonly REPEATABLE_AND_EXTENSIBLE_METADATA: string[] = [
    'sedici_description_note',
    'dc_description_abstract',
  ];
  
  static readonly EXCLUDED_IDS: Set<string> = new Set([
    'selected-text',
    'dc_type',
    'sedici_subtype',
    'dc_language',
    'sedici_description_fulltext',
    'sedici_description_peerReview',
    'dc_date_issued_month',
    'dc_date_issued_day',
    'dc_date_created_month',
    'dc_date_created_day',
    'sedici_date_exposure_month',
    'sedici_date_exposure_day',
  ]);
  
  static readonly EXCLUDED_IDS_FOR_BUTTONS: Set<string> = new Set([
    'selected-text',
    'dc_type',
    'sedici_subtype',
    'dc_language',
    'sedici_description_fulltext',
    'sedici_description_peerReview',
    'dc_date_issued_year',
    'dc_date_issued_month',
    'dc_date_issued_day',
    'dc_date_created_year',
    'dc_date_created_month',
    'dc_date_created_day',
    'sedici_date_exposure_year',
    'sedici_date_exposure_month',
    'sedici_date_exposure_day',
  ]);
  
  static readonly NAME_MAP: Record<string, string> = {
    'dc_date_issued_year': 'Fecha de publicación',
    'dc_date_created_year': 'Fecha de creación',
    'sedici_date_exposure_year': 'Fecha de presentación',
  };

  static readonly PEOPLE_METADATA: string[] = [
    'sedici_creator_person',
    'sedici_creator_interprete',
    'sedici_contributor_colaborator',
    'sedici_contributor_translator',
    'sedici_contributor_editor',
    'sedici_contributor_compiler',
    'sedici_contributor_director',
    'sedici_contributor_codirector',
    'sedici_contributor_juror',
    'sedici_contributor_inscriber',
  ];
}