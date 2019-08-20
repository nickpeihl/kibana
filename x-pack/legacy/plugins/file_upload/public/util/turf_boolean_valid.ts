/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/* eslint-disable */

/* @notice
 * This product includes code that is adapted from turf-boolean-valid, which is
 * available under a "MIT" license.
 * https://github.com/Turfjs/turf/tree/master/packages/turf-boolean-valid
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 TurfJS
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// @turf/boolean-valid is not published to the npm registry so we include it here

import { segmentEach } from '@turf/meta';
import { getGeom, getCoords, getType } from '@turf/invariant';
import { polygon, lineString, Feature, Geometry } from '@turf/helpers';
import booleanDisjoint from '@turf/boolean-disjoint';
import booleanCrosses from '@turf/boolean-crosses';
import lineIntersect from '@turf/line-intersect';
import isPointOnLine from '@turf/boolean-point-on-line';

/**
 * booleanValid checks if the geometry is a valid according to the OGC Simple Feature Specification.
 *
 * @name booleanValid
 * @param {Geometry|Feature<any>} feature GeoJSON Feature or Geometry
 * @returns {boolean} true/false
 * @example
 * var line = turf.lineString([[1, 1], [1, 2], [1, 3], [1, 4]]);
 *
 * turf.booleanValid(line); // => true
 * turf.booleanValid({foo: "bar"}); // => false
 */
export default function booleanValid(feature: Feature<any> | Geometry) {
    // Automatic False
    if (!feature.type) return false;

    // Parse GeoJSON
    debugger;
    const geom = getGeom(feature);
    const type = geom.type;
    const coords = geom.coordinates;

    switch (type) {
    case 'Point':
        return coords.length > 1;
    case 'MultiPoint':
        for (var i = 0; i < coords.length; i++) {
            if (coords[i].length < 2) return false;
        }
        return true;
    case 'LineString':
        if (coords.length < 2) return false
        for (var i = 0; i < coords.length; i++) {
            if (coords[i].length < 2) return false;
        }
        return true;
    case 'MultiLineString':
        if (coords.length < 2) return false
        for (var i = 0; i < coords.length; i++) {
            if (coords[i].length < 2) return false;
        }
        return true;
    case 'Polygon':
        for (var i = 0; i < geom.coordinates.length; i++) {
            if (coords[i].length < 4) return false
            if (!checkRingsClose(coords[i])) return false
            if (checkRingsForSpikesPunctures(coords[i])) return false
            if (i > 0) {
                if (lineIntersect(polygon([coords[0]]), polygon([coords[i]])).features.length > 1) return false
            }
        }
        return true
    case 'MultiPolygon':
        for (var i = 0; i < geom.coordinates.length; i++) {
            var poly: any = geom.coordinates[i];

            for (var ii = 0; ii < poly.length; ii++) {
                if (poly[ii].length < 4) return false
                if (!checkRingsClose(poly[ii])) return false
                if (checkRingsForSpikesPunctures(poly[ii])) return false
                if (ii === 0) {
                    if (!checkPolygonAgainstOthers(poly, geom.coordinates, i)) return false
                }
                if (ii > 0) {
                    if (lineIntersect(polygon([poly[0]]), polygon([poly[ii]])).features.length > 1) return false
                }
            }
        }
        return true
    default: return false;
    }
}

function checkRingsClose(geom) {
   return geom[0][0] === geom[geom.length - 1][0] || geom[0][1] === geom[geom.length - 1][1]
}

function checkRingsForSpikesPunctures(geom) {
    for (var i = 0; i < geom.length - 1; i++) {
        var point = geom[i]
        for (var ii = i + 1; ii < geom.length - 2; ii++) {
            var seg = [geom[ii], geom[ii + 1]]
            if (isPointOnLine(point, lineString(seg))) return true
        }
    }
    return false
}

function checkPolygonAgainstOthers(poly, geom, index) {
    var polyToCheck = polygon(poly)
    for (var i = index + 1; i < geom.length; i++) {
        if (!booleanDisjoint(polyToCheck, polygon(geom[i]))) {
            if (booleanCrosses(polyToCheck, lineString(geom[i][0]))) return false
        }
    }
    return true
}
