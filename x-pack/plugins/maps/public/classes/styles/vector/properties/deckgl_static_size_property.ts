/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { StaticStyleProperty } from './static_style_property';
import { VECTOR_STYLES } from '../../../../../common/constants';
import {
  HALF_LARGE_MAKI_ICON_SIZE,
  LARGE_MAKI_ICON_SIZE,
  SMALL_MAKI_ICON_SIZE,
  // @ts-expect-error
} from '../symbol_utils';
import { SizeStaticOptions } from '../../../../../common/descriptor_types';

export class DeckGLStaticSizeProperty extends StaticStyleProperty<SizeStaticOptions> {
  constructor(options: SizeStaticOptions, styleName: VECTOR_STYLES) {
    if (typeof options.size !== 'number') {
      super({ size: 1 }, styleName);
    } else {
      super(options, styleName);
    }
  }

  getIconPixelSize() {
    return this._options.size >= HALF_LARGE_MAKI_ICON_SIZE
      ? LARGE_MAKI_ICON_SIZE
      : SMALL_MAKI_ICON_SIZE;
  }

  getIconSize() {
    const halfIconPixels = this.getIconPixelSize() / 2;
    return this._options.size / halfIconPixels;
  }

  getLineWidth() {
    return this._options.size;
  }
}
