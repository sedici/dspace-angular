import { AsyncPipe } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  DynamicFormControlModel,
  DynamicFormService,
  DynamicInputModel,
  DynamicTextAreaModel,
  DynamicFormArrayModel,
} from '@ng-dynamic-forms/core';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';

import { ObjectCacheService } from 'src/app/core/cache/object-cache.service';
import { RequestService } from 'src/app/core/data/request.service';
import { CommunityDataService } from 'src/app/core/data/community-data.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { environment } from '../../../../../environments/environment';
import { ComcolPageLogoComponent } from '../../../../../app/shared/comcol/comcol-page-logo/comcol-page-logo.component';
import { FormComponent } from '../../../../../app/shared/form/form.component';
import { UploaderComponent } from '../../../../../app/shared/upload/uploader/uploader.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { CommunityFormComponent } from 'src/app/community-page/community-form/community-form.component';
import { DynamicScrollableDropdownModel } from 'src/app/shared/form/builder/ds-dynamic-form-ui/models/scrollable-dropdown/dynamic-scrollable-dropdown.model';
import { VocabularyOptions } from 'src/app/core/submission/vocabularies/models/vocabulary-options.model';
//import { DsDynamicOneboxComponent} from '../../../../../app/shared/form/builder/ds-dynamic-form-ui/models/onebox/dynamic-onebox.component';

/**
 * Form used for creating and editing communities
 */
@Component({
  selector: 'sedici-community-form',
  styleUrls: ['../../../../../app/shared/comcol/comcol-forms/comcol-form/comcol-form.component.scss'],
  templateUrl: '../../../../../app/shared/comcol/comcol-forms/comcol-form/comcol-form.component.html',
  imports: [
    AsyncPipe,
    ComcolPageLogoComponent,
    FormComponent,
    TranslateModule,
    UploaderComponent,
    VarDirective,
  ],
})
export class SediciCommunityFormComponent extends CommunityFormComponent implements OnChanges {

  constructor(
    protected formService: DynamicFormService,
    protected translate: TranslateService,
    protected notificationsService: NotificationsService,
    protected authService: AuthService,
    protected dsoService: CommunityDataService,
    protected requestService: RequestService,
    protected objectCache: ObjectCacheService,
    protected modalService: NgbModal,
  ) {
    super(
      formService,
      translate,
      notificationsService,
      authService,
      dsoService,
      requestService,
      objectCache,
      modalService
    );
  }

  public materiaVocabularyOptions: VocabularyOptions = {
        name: 'Materias_Authority_Provider',
        closed: false,
      };
  public origenVocabularyOptions: VocabularyOptions = {
        name: 'Rest_Institutions_Authority_Provider',
        closed: false,
      };

  override formModel: DynamicFormControlModel[] = [
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
            vocabularyOptions: this.origenVocabularyOptions,
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
            vocabularyOptions: this.materiaVocabularyOptions,
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
      new DynamicInputModel({
        id: 'ComCol color',
        name: 'sedici.comcol.color',
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
}
