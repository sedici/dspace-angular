import {
  DynamicFormControlModel,
  DynamicInputModel,
  DynamicSelectModelConfig,
  DynamicTextAreaModel,
  DynamicFormArrayModel,
} from '@ng-dynamic-forms/core';

import { DynamicScrollableDropdownModel } from 'src/app/shared/form/builder/ds-dynamic-form-ui/models/scrollable-dropdown/dynamic-scrollable-dropdown.model';
import { VocabularyOptions } from 'src/app/core/submission/vocabularies/models/vocabulary-options.model';

import { environment } from '../../../environments/environment';

export const collectionFormEntityTypeSelectionConfig: DynamicSelectModelConfig<string> = {
  id: 'entityType',
  name: 'dspace.entity.type',
  disabled: false,
};

export const materiaVocabularyOptions: VocabularyOptions = {
        name: 'Materias_Authority_Provider',
        closed: false,
      };
export const origenVocabularyOptions: VocabularyOptions = {
        name: 'Rest_Institutions_Authority_Provider',
        closed: false,
  };

/**
 * The dynamic form fields used for creating/editing a collection
 * @type {(DynamicInputModel | DynamicTextAreaModel)[]}
 */
export const collectionFormModels: DynamicFormControlModel[] = [
      new DynamicInputModel({
              id: 'title',
              name: 'dc.title',
              required: true,
              validators: {
                required: null,
              },
              errorMessages: {
                required: 'Please enter a name for this title',
              },
            }),
            new DynamicTextAreaModel({
              id: 'description',
              name: 'dc.description',
              spellCheck: environment.form.spellCheck,
            }),
            new DynamicFormArrayModel({
              id: 'personasMultiple',
              label: 'Personas',
              groupFactory: () => [
                new DynamicInputModel({
                  id: 'staff',
                  name: 'dc.contributor',
                })
              ]
            }),
            new DynamicFormArrayModel({
              id: 'entidades',
              label: 'Entidades origen',
              groupFactory: () => [
                new DynamicScrollableDropdownModel({
                  id: 'entidadOrigen',
                  name: 'mods.originInfo.place',
                  vocabularyOptions: origenVocabularyOptions,
                  repeatable: true,
                  metadataFields: ['mods.originInfo.place'],
                  submissionId: '',
                  hasSelectableMetadata: false,
                  readOnly: false,
                  disabled: false,
                }),
              ]
            }),
            new DynamicInputModel({
              id: 'fecha',
              name: 'dc.date.issued',
            }),
            new DynamicInputModel({
              id: 'lugar',
              name: 'mods.location',
              spellCheck: environment.form.spellCheck,
            }),
            new DynamicInputModel({
              id: 'issn',
              name: 'sedici.identifier.issn',
              spellCheck: environment.form.spellCheck,
            }),
            new DynamicTextAreaModel({
              id: 'abstract',
              name: 'dc.description.abstract',
              spellCheck: environment.form.spellCheck,
            }),
            new DynamicInputModel({
              id: 'localizacion',
              name: 'sedici.identifier.uri',
            }),
            new DynamicInputModel({
              id: 'director',
              name: 'sedici.contributor.director',
            }),
            new DynamicFormArrayModel({
              id: 'materiaMultiple',
              label: 'Materias',
              groupFactory: () => [
                new DynamicScrollableDropdownModel({
                  id: 'materia',
                  name: 'sedici.subject.materias',
                  vocabularyOptions: materiaVocabularyOptions,
                  repeatable: true,
                  metadataFields: ['sedici.subject.materias'],
                  submissionId: '',
                  hasSelectableMetadata: false,
                  readOnly: false,
                  disabled: false,
                }),
              ]
            }),
            new DynamicInputModel({
              id: 'editor',
              name: 'dc.contributor.editor',
            }),
            // new DynamicScrollableDropdownModel({
            //   id: 'materiasA',
            //   vocabularyOptions: this.vocabularyOptions,
            //   repeatable: true,
            //   metadataFields: ['sedici.subject.materias'],
            //   submissionId: '',
            //   hasSelectableMetadata: false,
            //   readOnly: false,
            // }),
            new DynamicInputModel({
              id: 'fecha',
              name: 'dc.date.exposure',
            }),
            new DynamicInputModel({
              id: 'subtitulo',
              name: 'sedici.title.subtitle',
            }),
            new DynamicInputModel({
              id: 'notas',
              name: 'sedici.description.note',
            }),
            new DynamicInputModel({
              id: 'frecuencia',
              name: 'sedici.description.frecuencia',
            }),
            new DynamicTextAreaModel({
              id: 'rights',
              name: 'dc.rights',
              spellCheck: environment.form.spellCheck,
            }),
            new DynamicTextAreaModel({
              id: 'tableofcontents',
              name: 'dc.description.tableofcontents',
              spellCheck: environment.form.spellCheck,
            }),
];
