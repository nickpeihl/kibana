/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
//@ts-expect-error
import { Deck } from '@deck.gl/core';
//@ts-expect-error
import { MapboxLayer } from '@deck.gl/mapbox';
//@ts-expect-error
import { ArcLayer } from '@deck.gl/layers';
import { FeatureCollection } from 'geojson';
import { Map as MbMap } from 'mapbox-gl';
import { IDeckArcStyle, DeckArcStyle } from '../../styles/deckgl/arc_style';
import { ArcLayerDescriptor, VectorLayerDescriptor } from '../../../../common/descriptor_types';
import { AbstractLayer, ILayer } from '../layer';
import { IVectorSource } from '../../sources/vector_source';
import { VectorLayer, IVectorLayer, VectorLayerArguments } from '../vector_layer';
import { EMPTY_FEATURE_COLLECTION, LAYER_TYPE } from '../../../../common/constants';
import { IField } from '../../fields/field';

export interface IDeckArcLayer extends ILayer {
  getStyleEditorFields(): Promise<IField[]>;
}

export class DeckArcLayer extends AbstractLayer implements IDeckArcLayer {
  static type = LAYER_TYPE.ARC;

  private readonly _mapboxLayer: MapboxLayer;
  protected readonly _style: IDeckArcStyle;

  static createDescriptor(
    options: Partial<ArcLayerDescriptor>,
    mapColors?: string[]
  ): ArcLayerDescriptor {
    const layerDescriptor = super.createDescriptor(options);
    layerDescriptor.type = DeckArcLayer.type;

    if (!options.style) {
      const styleProperties = DeckArcStyle.createDefaultStyleProperties(mapColors ? mapColors : []);
      layerDescriptor.style = DeckArcStyle.createDescriptor(styleProperties);
    }
    return layerDescriptor as ArcLayerDescriptor;
  }

  constructor({ layerDescriptor, source, chartsPaletteServiceGetColor }: VectorLayerArguments) {
    super({
      layerDescriptor,
      source,
    });
    this._style = new DeckArcStyle(
      layerDescriptor.style,
      source,
      this,
      chartsPaletteServiceGetColor
    );
    this._mapboxLayer = new MapboxLayer({
      id: this._getMbArcLayerId(),
      type: ArcLayer,
      data: EMPTY_FEATURE_COLLECTION.features,
      getSourcePosition: (d) => d.geometry.coordinates[0],
      getTargetPosition: (d) => d.geometry.coordinates[1],
    });
  }

  _getMbArcLayerId() {
    return this.makeMbLayerId('arc');
  }

  _getSourceFeatureCollection() {
    const sourceDataRequest = this.getSourceDataRequest();
    return sourceDataRequest ? (sourceDataRequest.getData() as FeatureCollection) : null;
  }

  _syncFeatureCollectionWithDeck(mbMap: MbMap) {
    const featureCollection = this._getSourceFeatureCollection();
    if (!featureCollection) {
      this._mapboxLayer.setProps({
        data: EMPTY_FEATURE_COLLECTION.features,
      });
      return;
    }

    if (featureCollection && featureCollection.features) {
      this._mapboxLayer.setProps({
        data: featureCollection.features,
      });
    }
  }

  _syncStylePropertiesWithMb(mbMap: MbMap) {
    this.getCurrentStyle().setColorProperties(this.getAlpha(), this._mapboxLayer);
  }

  getStyleForEditing(): IDeckArcStyle {
    return this._style;
  }

  getStyle(): IDeckArcStyle {
    return this._style;
  }

  getCurrentStyle(): IDeckArcStyle {
    return this._style;
  }

  getLayerTypeIconName() {
    return 'vector';
  }

  ownsMbLayerId(mbLayerId: string) {
    return this._getMbArcLayerId() === mbLayerId;
  }

  async getStyleEditorFields() {
    const sourceFields = await (this.getSourceForEditing() as IVectorSource).getFields();
    return sourceFields;
  }

  syncLayerWithMB(mbMap: MbMap) {
    this._syncFeatureCollectionWithDeck(mbMap);
    this._syncStylePropertiesWithMb(mbMap);
  }
}
