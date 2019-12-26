import { DynamicFormControlLayout, serializable } from '@ng-dynamic-forms/core';
import { DsDynamicInputModel, DsDynamicInputModelConfig } from '../ds-dynamic-input.model';

export const DYNAMIC_FORM_CONTROL_TYPE_DISABLED = 'EMPTY';

export interface DsDynamicDisabledModelConfig extends DsDynamicInputModelConfig {
  value?: any;
}

/**
 * This model represents the data for a disabled input field
 */
export class DynamicDisabledModel extends DsDynamicInputModel {

  @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_DISABLED;
  @serializable() value: any;

  constructor(config: DsDynamicDisabledModelConfig, layout?: DynamicFormControlLayout) {
    super(config, layout);
    this.readOnly = true;
    this.disabled = true;
    this.valueUpdates.next(config.value);
  }
}
