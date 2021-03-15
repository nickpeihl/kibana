
import React, { Component } from 'react';
import DeckGL from '@deck.gl/react';
import { BitmapLayer, ArcLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { euiPalettePositive } from '@elastic/eui';
import tinycolor from 'tinycolor2';
import { scaleLinear } from 'd3-scale';
import { getSourceDest } from './mock_siem';
import { hexToRgb } from '@elastic/eui/lib/services/color';
const INITIAL_VIEW_STATE = {
  longitude: -20,
  latitude: 18,
  zoom: 1,
  pitch: 0,
  bearing: 0
};

const START_TIME = 1602979200000;

const data = getSourceDest();

const colors = euiPalettePositive(5);

export class DeckMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0
    };
  }

  componentDidMount() {
    // this._animate()
  }

  componentWillUnmount() {
    // if (this._animationFrame) {
    //   window.cancelAnimationFrame(this._animationFrame);
    // }
  }

  _getScaler = (domain, range) => scaleLinear().domain(domain).rangeRound(range)

  _renderLayers = () => {
    return [
      new TileLayer({
        data: `https://tiles.maps.elastic.co/styles/dark-matter/{z}/{x}/{y}.png?elastic_tile_service_tos=agree&my_app_name=kibana&license=643c1faf-80fc-4ab0-9323-4d9bd11f4bbc`,
        minZoom: 0,
        maxZoom: 18,
        tileSize: 256,
        renderSubLayers: (props) => {
          const {
            bbox: { west, south, east, north }
          } = props.tile;

          return new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north]
          })
        }
      }),
      new ArcLayer({
        id: 'pewpew-layer',
        data: data.coordinates,
        pickable: true,
        getWidth: d => {
          const scaler = this._getScaler(data.count, [1, 12]);
          return scaler(d.count);
        },
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.dest,
        getSourceColor: d => {
          const scaler = this._getScaler(data.time, [0, colors.length-1]);
          const colorIndex = scaler(d.time);
          const color = colors[colorIndex];
          if (color === undefined) debugger;
          const rgb = tinycolor(color).toRgb();
          const deckColor = [rgb.r, rgb.g, rgb.b, 20]
          return deckColor;
        },
        getTargetColor: d => {
          const scaler = this._getScaler(data.time, [0, colors.length-1]);
          const color = colors[scaler(d.time)];
          const rgb = tinycolor(color).toRgb();
          const deckColor = [rgb.r, rgb.g, rgb.b, 255]
          return deckColor;
        },
        getTilt: d => {
          const tilt = d.source[0] >= d.dest[0] ? -90 : 90
          return tilt;
        },
        getHeight: 0.5,
        wrapLongitude: true
      })
    ];
  }

  // _animate() {
  //   const loopLength = 1800;
  //   const animationSpeed = 60;
  //   const timestamp = Date.now() / 1000;
  //   const loopTime = loopLength / animationSpeed;
  //   const curTime = (( timestamp & loopTime ) / loopTime) * loopLength;
  //   console.log(curTime);
  //   this.setState({
  //     time: curTime
  //   });

  //   this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  // }

  // _renderLayers = () => {
  //   return [
  //     new TileLayer({
  //       data: `https://tiles.maps.elastic.co/styles/dark-matter/{z}/{x}/{y}.png?elastic_tile_service_tos=agree&my_app_name=kibana&license=643c1faf-80fc-4ab0-9323-4d9bd11f4bbc`,
  //       minZoom: 0,
  //       maxZoom: 18,
  //       tileSize: 256,
  //       renderSubLayers: (props) => {
  //         const {
  //           bbox: { west, south, east, north }
  //         } = props.tile;

  //         return new BitmapLayer(props, {
  //           data: null,
  //           image: props.data,
  //           bounds: [west, south, east, north]
  //         })
  //       }
  //     }),
  //     new TripsLayer({
  //       id: 'pewpew-layer',
  //       data,
  //       getPath: d => d.path,
  //       getTimestamps: d => d.timestamps,
  //       getColor:  [253, 128, 93],
  //       opacity: 0.3,
  //       widthMinPixels: 2,
  //       rounded: true,
  //       trailLength: 30,
  //       currentTime: this.state.time,
  //       shadowEnabled: false,
  //     }),
  //   ];
  // }

  render() {
    const {
      initialViewState = INITIAL_VIEW_STATE,
    } = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={initialViewState}
        controller={true}
      >
      </DeckGL>
    );
  }
}
