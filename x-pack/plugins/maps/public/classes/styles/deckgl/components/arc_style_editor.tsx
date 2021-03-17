/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { EuiSpacer } from '@elastic/eui';
import { VectorStyleColorEditor } from '../../vector/components/color/vector_style_color_editor';
import { VectorStyleSizeEditor } from '../../vector/components/size/vector_style_size_editor';
import {
  getDefaultDynamicProperties,
  getDefaultStaticProperties,
} from '../../vector/vector_style_defaults';
import {
  createStyleFieldsHelper,
  StyleField,
  StyleFieldsHelper,
} from '../../vector/style_fields_helper';
import { VECTOR_STYLES, STYLE_TYPE, VECTOR_SHAPE_TYPE } from '../../../../../common/constants';
import { IStyleProperty } from '../../vector/properties/style_property';
import { StyleProperties } from '../../vector/components/vector_style_editor';
import { IDeckArcLayer } from '../../../layers/deckgl_layers';
import { DEFAULT_LINE_COLORS } from '../../color_palettes';
import {
  ArcLayerStylePropertiesDescriptor,
  ColorDynamicOptions,
  ColorStaticOptions,
  DynamicStylePropertyOptions,
  SizeDynamicOptions,
  SizeStaticOptions,
  StaticStylePropertyOptions,
} from '../../../../../common/descriptor_types';

interface Props {
  layer: IDeckArcLayer;
  handlePropertyChange: (propertyName: VECTOR_STYLES, stylePropertyDescriptor: unknown) => void;
  styleProperties: StyleProperties;
}

interface State {
  styleFields: StyleField[];
  defaultDynamicProperties: ArcLayerStylePropertiesDescriptor;
  defaultStaticProperties: ArcLayerStylePropertiesDescriptor;
  supportedFeatures: VECTOR_SHAPE_TYPE[];
  selectedFeature: VECTOR_SHAPE_TYPE;
  styleFieldsHelper?: StyleFieldsHelper;
}

export class ArcStyleEditor extends Component<Props, State> {
  private _isMounted: boolean = false;

  constructor(props: Props) {
    super(props);
    const selectedFeature = VECTOR_SHAPE_TYPE.LINE;

    this.state = {
      styleFields: [],
      defaultDynamicProperties: getDefaultDynamicProperties(),
      defaultStaticProperties: getDefaultStaticProperties(),
      supportedFeatures: [],
      selectedFeature,
    };
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this._loadFields();
    this._loadSupportedFeatures();
  }

  componentDidUpdate() {
    this._loadFields();
    this._loadSupportedFeatures();
  }

  async _loadFields() {
    const styleFieldsHelper = await createStyleFieldsHelper(
      await this.props.layer.getStyleEditorFields()
    );
    const styleFields = styleFieldsHelper.getStyleFields();
    if (
      !this._isMounted ||
      (_.isEqual(styleFields, this.state.styleFields) && this.state.styleFieldsHelper !== undefined)
    ) {
      return;
    }

    this.setState({
      styleFields,
      styleFieldsHelper,
    });
  }

  _onStaticStyleChange = (propertyName: VECTOR_STYLES, options: StaticStylePropertyOptions) => {
    const styleDescriptor = {
      type: STYLE_TYPE.STATIC,
      options,
    };
    this.props.handlePropertyChange(propertyName, styleDescriptor);
  };

  _onDynamicStyleChange = (propertyName: VECTOR_STYLES, options: DynamicStylePropertyOptions) => {
    const styleDescriptor = {
      type: STYLE_TYPE.DYNAMIC,
      options,
    };
    this.props.handlePropertyChange(propertyName, styleDescriptor);
  };

  _renderLineColor() {
    return (
      <VectorStyleColorEditor
        swatches={DEFAULT_LINE_COLORS}
        onStaticStyleChange={this._onStaticStyleChange}
        onDynamicStyleChange={this._onDynamicStyleChange}
        styleProperty={
          this.props.styleProperties[VECTOR_STYLES.LINE_COLOR] as IStyleProperty<
            ColorDynamicOptions | ColorStaticOptions
          >
        }
        fields={this.state.styleFieldsHelper!.getFieldsForStyle(VECTOR_STYLES.LINE_COLOR)}
        defaultStaticStyleOptions={
          this.state.defaultStaticProperties[VECTOR_STYLES.LINE_COLOR].options as ColorStaticOptions
        }
        defaultDynamicStyleOptions={
          this.state.defaultDynamicProperties[VECTOR_STYLES.LINE_COLOR]
            .options as ColorDynamicOptions
        }
      />
    );
  }

  _renderLineWidth() {
    return (
      <VectorStyleSizeEditor
        onStaticStyleChange={this._onStaticStyleChange}
        onDynamicStyleChange={this._onDynamicStyleChange}
        styleProperty={
          this.props.styleProperties[VECTOR_STYLES.LINE_WIDTH] as IStyleProperty<
            SizeDynamicOptions | SizeStaticOptions
          >
        }
        fields={this.state.styleFieldsHelper!.getFieldsForStyle(VECTOR_STYLES.LINE_WIDTH)}
        defaultStaticStyleOptions={
          this.state.defaultStaticProperties[VECTOR_STYLES.LINE_WIDTH].options as SizeStaticOptions
        }
        defaultDynamicStyleOptions={
          this.state.defaultDynamicProperties[VECTOR_STYLES.LINE_WIDTH]
            .options as SizeDynamicOptions
        }
      />
    );
  }

  _renderProperties() {
    const { supportedFeatures, selectedFeature, styleFieldsHelper } = this.state;

    if (supportedFeatures.length === 0 || !styleFieldsHelper) {
      return null;
    }

    if (supportedFeatures.length === 1) {
      return (
        <Fragment>
          {this._renderLineColor()}
          <EuiSpacer size="m" />

          {this._renderLineWidth()}
          <EuiSpacer size="m" />
        </Fragment>
      );
    }
  }

  async _loadSupportedFeatures() {
    const supportedFeatures = [VECTOR_SHAPE_TYPE.LINE];
    if (this._isMounted && !_.isEqual(supportedFeatures, this.state.supportedFeatures)) {
      this.setState({ supportedFeatures });
    }
  }

  render() {
    return <Fragment>{this._renderProperties()}</Fragment>;
  }
}
