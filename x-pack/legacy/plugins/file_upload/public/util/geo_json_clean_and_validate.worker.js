/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import booleanValid from './turf_boolean_valid';
import buffer from '@turf/buffer';
import rewind from 'geojson-rewind';

onmessage = e => {
  const result = geoJsonCleanAndValidate(e.data[0]);
  postMessage(result);
};

function geoJsonCleanAndValidate(geoJson) {
  const isSingleFeature = geoJson.type === 'Feature';
  const features = isSingleFeature
    ? [{ ...geoJson }]
    : geoJson.features;

  // Pass features for cleaning
  const cleanedFeatures = cleanFeatures(features);

  // Put clean features back in geoJson object
  const cleanGeoJson = {
    ...geoJson,
    ...(isSingleFeature
      ? cleanedFeatures[0]
      : { features: cleanedFeatures }
    ),
  };

  // Pass entire geoJson object for winding
  // JSTS does not enforce winding order, wind in clockwise order
  const correctlyWindedGeoJson = rewind(cleanGeoJson, false);
  return correctlyWindedGeoJson;
}

export function cleanFeatures(features) {
  return features.map(({ id, geometry, properties }) => {
    const geojsonGeometry = booleanValid(geometry)
      ? geometry
      : buffer(geometry, 0);
    return ({
      type: 'Feature',
      geometry: geojsonGeometry,
      ...(id ? { id } : {}),
      ...(properties ? { properties } : {}),
    });
  });
}
