/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
//@ts-expect-error
import { MapboxLayer } from '@deck.gl/mapbox';
import { IStyle } from '../style';
import { LAYER_STYLE_TYPE, VECTOR_STYLES } from '../../../../common/constants';
import { IVectorSource } from '../../sources/vector_source';
import { IDeckArcLayer } from '../../layers/deckgl_layers';
import { getDefaultStaticProperties } from '../vector/vector_style_defaults';
import { StaticColorProperty } from '../vector/properties/static_color_property';
import { DynamicColorProperty } from '../vector/properties/dynamic_color_property';
import { StaticStyleProperty } from '../vector/properties/static_style_property';
import { DynamicStyleProperty } from '../vector/properties/dynamic_style_property';
import { DeckGLStaticStyleProperty } from '../vector/properties/deckgl_static_style_property';
import { DeckGLStaticColorProperty } from '../vector/properties/deckgl_static_color_property';
import { DeckGLStaticSizeProperty } from '../vector/properties/deckgl_static_size_property';
import {
  ColorDynamicOptions,
  ColorStaticOptions,
  ColorStylePropertyDescriptor,
  DeckGLColor,
  DynamicStyleProperties,
  DynamicStylePropertyOptions,
  IconDynamicOptions,
  IconStaticOptions,
  IconStylePropertyDescriptor,
  LabelDynamicOptions,
  LabelStaticOptions,
  LabelStylePropertyDescriptor,
  OrientationDynamicOptions,
  OrientationStaticOptions,
  OrientationStylePropertyDescriptor,
  SizeDynamicOptions,
  SizeStaticOptions,
  SizeStylePropertyDescriptor,
  StyleDescriptor,
  StyleMetaDescriptor,
  StylePropertyField,
  StylePropertyOptions,
  VectorStyleDescriptor,
  VectorStylePropertiesDescriptor,
} from '../../../../common/descriptor_types';
import { StyleProperties } from '../vector/components/vector_style_editor';
import { ArcStyleEditor } from './components/arc_style_editor';

export interface IDeckArcStyle extends IStyle {
  setColorProperties: (
    alpha: number,
    deckLayer: MapboxLayer
  ) => void;
}

export class DeckArcStyle implements IDeckArcStyle {

  private readonly _descriptor: VectorStyleDescriptor;
  private readonly _source: IVectorSource;
  private readonly _layer: IDeckArcLayer;

  private readonly _arcSourceColorStyleProperty: DeckGLStaticColorProperty;
  private readonly _arcTargetColorStyleProperty: DeckGLStaticColorProperty;
  private readonly _lineWidthStyleProperty: DeckGLStaticSizeProperty;


  static createDescriptor(
    properties: Partial<VectorStylePropertiesDescriptor> = {},
    isTimeAware = true,
  ) {
    return {
      type: LAYER_STYLE_TYPE.DECKGL,
      properties: { ...getDefaultStaticProperties(), ...properties },
      isTimeAware,
    }
  }

  static createDefaultStyleProperties(mapColors: string[]) {
    return getDefaultStaticProperties(mapColors);
  }

  constructor(
    descriptor: VectorStyleDescriptor | null,
    source: IVectorSource,
    layer: IDeckArcLayer,
    chartsPaletteServiceGetColor?: (value: string) => string | null
  ) {
    this._source = source,
    this._layer = layer,
    this._descriptor = descriptor
    ? {
      ...descriptor,
      ...DeckArcStyle.createDescriptor(descriptor.properties, descriptor.isTimeAware),
    }
    : DeckArcStyle.createDescriptor();

    this._arcSourceColorStyleProperty = this._makeColorProperty(
      this._descriptor.properties[VECTOR_STYLES.LINE_COLOR],
      VECTOR_STYLES.LINE_COLOR,
      chartsPaletteServiceGetColor
    )

    this._arcTargetColorStyleProperty = this._makeColorProperty(
      this._descriptor.properties[VECTOR_STYLES.LINE_COLOR],
      VECTOR_STYLES.LINE_COLOR,
      chartsPaletteServiceGetColor
    )

    this._lineWidthStyleProperty = this._makeSizeProperty(
      this._descriptor.properties[VECTOR_STYLES.LINE_WIDTH],
      VECTOR_STYLES.LINE_WIDTH,
      false,
    )
  }

  _makeColorProperty(
    descriptor: ColorStylePropertyDescriptor | undefined,
    styleName: VECTOR_STYLES,
    chartsPaletteServiceGetColor?: (value: string) => string | null
  ) {
    if (!descriptor || !descriptor.options) {
      return new DeckGLStaticColorProperty({ color: '' }, styleName);
    } else if (descriptor.type === StaticColorProperty.type) {
      return new DeckGLStaticColorProperty(descriptor.options as ColorStaticOptions, styleName);
    } else if (descriptor.type === DynamicColorProperty.type) {
      return new DeckGLStaticColorProperty(descriptor.options as ColorStaticOptions, styleName);
    } else {
      throw new Error(`${descriptor} not implemented`);
    }
  }

  _makeSizeProperty(
    descriptor: SizeStylePropertyDescriptor | undefined,
    styleName: VECTOR_STYLES,
    isSymbolizedAsIcon: boolean
  ) {
    if (!descriptor || !descriptor.options) {
      return new DeckGLStaticSizeProperty({ size: 0 }, styleName);
    } else if (descriptor.type === StaticStyleProperty.type) {
      return new DeckGLStaticSizeProperty(descriptor.options as SizeStaticOptions, styleName);
    } else if (descriptor.type === DynamicStyleProperty.type) {
      return new DeckGLStaticSizeProperty(descriptor.options as SizeStaticOptions, styleName);
    } else {
      throw new Error(`${descriptor} not implemented`);
    }
  }

  getType() {
    return LAYER_STYLE_TYPE.DECKGL;
  }

  renderEditor(onStyleDescriptorChange: (styleDescriptor: StyleDescriptor) => void) {
    const handlePropertyChange = () => {};
    const styleProperties: StyleProperties = {};
    return (
      <ArcStyleEditor
        handlePropertyChange={handlePropertyChange}
        styleProperties={styleProperties}
        layer={this._layer}
      />
    )
  }

  setColorProperties(
    alpha: number,
    deckLayer: MapboxLayer
  ) {
    deckLayer.setProps({
      getSourceColor: this._arcSourceColorStyleProperty.getColor(alpha),
      getTargetColor: this._arcTargetColorStyleProperty.getColor(alpha),
    })
  }
}
