/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { StaticStyleProperty } from './static_style_property';
import { ColorStaticOptions } from '../../../../../common/descriptor_types';
import tinycolor from 'tinycolor2';

export class DeckGLStaticColorProperty extends StaticStyleProperty<ColorStaticOptions> {
  getColor(alpha: number) {
    const rgba = tinycolor(this._options.color);
    rgba.setAlpha(alpha * 255);
    return Object.values(rgba.toRgb());
  }
}
