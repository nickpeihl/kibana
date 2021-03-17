# Deck.GL Space Time

## Goals

1. Investigate using DeckGL's `IconLayer` for allowing custom icons (SVG or PNG) for map overlays. Currently, this is not possible as our Maki icons are prebuilt as PNGs with a signed distance function applied to apply dynamic size and colors. SVGs in Mapbox-GL do not support dynamic sizing and coloring.

2. Investigate using DeckGL's `ArcLayer` to enhance the pew-pew maps with arcs rather than straight lines. 

3. If Deck.GL is not feasible, investigate whether we can natively apply the signed distance function to custom SVGs within the browser. Possibly re-using code from `tiny-sdf`.

## Notes

### React-map-gl
Deck.GL can be a pane of glass over top of mapbox-gl-js. Deck.GL uses react-map-gl to do this. But we don't use react-map-gl, so we may need to figure out how to allow Deck.GL to listen and react to pan and zoom changes in our mb implementation. Additionally, we cannot use react-map-gl as it only supports Mapbox basemaps with DeckGL overlays. We would need to refactor our overlay layers to use DeckGL exclusively.

### Deck Overlay
Originally, I planned to add Deck.GL as a pane of glass over top of the Mapbox map. But I believe this means all deckgl layers will have a z-position over top of any mapbox layers regardless of the positioning via the legend. This is probably unwanted behavior.

### MapboxLayer
An alternative is to use the MapboxLayer module in deck.gl. The MapboxLayer needs to be instantiated with a type (ex. `ArcLayer`, `IconLayer`). This might require introducing a new `Layer` type. It would be nice to re-use much of the existing components from `VectorLayer` but they appear to be tightly coupled to `VectorLayer`. 


### MapboxLayer with Deck instance
Alternatively, we can create a single `Deck` instance on the mapbox gl context. The `Deck` instance contains an array of layers that are accessed an can be added to the mapbox map by the `id`. We need access to the `Deck` instance in the `VectorLayer` so we can modify the `layers` array as Deck.gl layers are added, removed, or updated.

Unfortunately, when using the Deck.gl instance within the mapbox gl context, interactivity is broken (https://github.com/visgl/deck.gl/issues/3727). So that is not a possibility.

### Styling
Deck.gl layers are styled separately from the mapbox map. Each layer has its own (often unique) methods for applying styles, (ex. `getWidth`, `getSourceColor`, `getTargetColor`, `getFillColor`). This is different from the mapbox implementation that uses style expressions. 

### Data
Unlike Mapbox layers which use Map sources for features, Deck.GL layers have a `data` property that can be a function or an array. Deck.GL layers also use accessor functions to retrieve the features and styles from the `data` property, (ex. `getSourcePosition: (data) => data.geometry.coordinates[0]`). 

