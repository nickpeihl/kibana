/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';
import { EmbeddableFactoryDefinition, IContainer } from '@kbn/embeddable-plugin/public';
import { lazyLoadReduxEmbeddablePackage } from '@kbn/presentation-util-plugin/public';
import {
  createTimeSliderExtract,
  createTimeSliderInject,
} from '../../../common/time_slider/time_slider_persistable_state';
import { TIME_SLIDER_CONTROL } from '../..';
import { ControlInput, IEditableControlFactory } from '../../types';
import { CONTROL_GROUP_NAME, CONTROL_GROUP_TYPE } from '../../../common';

export class TimeSliderEmbeddableFactory
  implements EmbeddableFactoryDefinition, IEditableControlFactory<ControlInput>
{
  public type = TIME_SLIDER_CONTROL;

  public readonly grouping = [
    {
      id: CONTROL_GROUP_TYPE,
      getDisplayName: () => CONTROL_GROUP_NAME,
    },
  ];

  constructor() {}

  public async create(initialInput: any, parent?: IContainer) {
    const reduxEmbeddablePackage = await lazyLoadReduxEmbeddablePackage();
    const { TimeSliderControlEmbeddable } = await import('./time_slider_embeddable');

    return Promise.resolve(
      new TimeSliderControlEmbeddable(reduxEmbeddablePackage, initialInput, {}, parent)
    );
  }

  public isFieldCompatible = () => false;

  public isEditable = () => Promise.resolve(false);

  public canCreateNew(): boolean {
    return false;
  }

  public getDisplayName = () =>
    i18n.translate('controls.timeSlider.displayName', {
      defaultMessage: 'Time slider',
    });
  public getIconType = () => 'clock';
  public getDescription = () =>
    i18n.translate('controls.timeSlider.description', {
      defaultMessage: 'Add a slider for selecting a time range',
    });

  public inject = createTimeSliderInject();
  public extract = createTimeSliderExtract();
}
