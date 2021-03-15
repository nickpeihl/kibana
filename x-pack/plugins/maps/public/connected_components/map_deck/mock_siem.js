/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import { parsePointFromKey } from '../../classes/sources/es_pew_pew_source/convert_to_lines';

export const convertToPaths = (baseTime) => {
  const data = [];
  const currentTime = baseTime; // Smallest timestamp from response
  const destBuckets = _.get(hourlySiemRes, 'aggregations.destSplit.buckets', []);
  for (let i = 0; i < destBuckets.length; i++) {
    const destBucket = destBuckets[i];
    const dest = parsePointFromKey(destBucket.key);
    const timeBuckets = _.get(destBucket, 'dateHistogram.buckets', []);
    for (let j = 0; j < timeBuckets.length; j++) {
      const timeBucket = timeBuckets[j];
      const timeWindow = (timeBucket.key - currentTime) / 60000;
      const sourceBuckets = _.get(timeBucket, 'sourceGrid.buckets', []);
      for (let k = 0; k < sourceBuckets.length; k++) {
        const sourceBucket = sourceBuckets[k];
        const sourceCentroid = sourceBucket.sourceCentroid;
        data.push({
          path: [[sourceCentroid.location.lon, sourceCentroid.location.lat],
            dest], timestamps: [timeWindow, timeWindow + 60]
        });
      }
    }
  }
  return data;
}

export const getSourceDest = () => {
  const data = {
    count: [Infinity, 0],
    time: [Infinity, 0],
    coordinates: [],
  };
  const destBuckets = _.get(hourlySiemRes, 'aggregations.destSplit.buckets', []);
  for (let i = 0; i < destBuckets.length; i++) {
    const destBucket = destBuckets[i];
    const dest = parsePointFromKey(destBucket.key);
    const timeBuckets = _.get(destBucket, 'dateHistogram.buckets', []);
    for (let j = 0; j < timeBuckets.length; j++) {
      const timeBucket = timeBuckets[j];
      const sourceBuckets = _.get(timeBucket, 'sourceGrid.buckets', []);
      for (let k = 0; k < sourceBuckets.length; k++) {
        const sourceBucket = sourceBuckets[k];
        const sourceCentroid = sourceBucket.sourceCentroid;
        data.count[0] = Math.min(data.count[0], sourceCentroid.count);
        data.count[1] = Math.max(data.count[1], sourceCentroid.count);
        data.time[0] = Math.min(data.time[0], timeBucket.key);
        data.time[1] = Math.max(data.time[1], timeBucket.key);
        data.coordinates.push({ source: [sourceCentroid.location.lon, sourceCentroid.location.lat], dest, count: sourceCentroid.count, time: timeBucket.key });
      }
    }
  }
  return data;
}

const hourlySiemRes = {
  "took": 105,
  "timed_out": false,
  "_shards": {
    "total": 3,
    "successful": 3,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 10000,
      "relation": "gte"
    },
    "max_score": null,
    "hits": []
  },
  "aggregations": {
    "destSplit": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "51.514199981465936, -0.0931000616401434",
          "doc_count": 84405,
          "dateHistogram": {
            "buckets": [
              {
                "key_as_string": "2020-10-18T00:00:00.000Z",
                "key": 1602979200000,
                "doc_count": 621,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 225,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.755841756425795,
                          "lon": -117.00773205086588
                        },
                        "count": 225
                      },
                      "sum_of_destination.bytes": {
                        "value": 1948266.0
                      },
                      "sum_of_source.bytes": {
                        "value": 60929.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 190,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.596396282780915,
                          "lon": 117.2744141785722
                        },
                        "count": 190
                      },
                      "sum_of_destination.bytes": {
                        "value": 495284.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290679.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 105,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.627536170982886,
                          "lon": 20.43619709302272
                        },
                        "count": 105
                      },
                      "sum_of_destination.bytes": {
                        "value": 34322.0
                      },
                      "sum_of_source.bytes": {
                        "value": 29375.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.980729148490354,
                          "lon": -79.78041256545112
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 34503.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15474.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.879793727304786,
                          "lon": -5.47746877593454
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 13193.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10486.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 23.13939089421183,
                          "lon": 75.38942722434348
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 10922.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7054.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -31.37608000729233,
                          "lon": -61.793700048699975
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.96669999603182,
                          "lon": 23.716699965298176
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.13249996677041,
                          "lon": 93.35889992304146
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 340.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.230900017544627,
                          "lon": 28.058299999684095
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.59539997763932,
                          "lon": -96.7017000541091
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T00:15:00.000Z",
                "key": 1602980100000,
                "doc_count": 667,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 214,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.45301633292078,
                          "lon": -116.90243649431373
                        },
                        "count": 214
                      },
                      "sum_of_destination.bytes": {
                        "value": 1899269.0
                      },
                      "sum_of_source.bytes": {
                        "value": 65119.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 211,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.754154470550578,
                          "lon": 115.40213409224216
                        },
                        "count": 211
                      },
                      "sum_of_destination.bytes": {
                        "value": 639525.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248588.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 119,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.96661174104807,
                          "lon": 28.024401639924704
                        },
                        "count": 119
                      },
                      "sum_of_destination.bytes": {
                        "value": 17348.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14960.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.947999972765416,
                          "lon": -5.2542818490077146
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 14774.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11850.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1384.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.65402854566595,
                          "lon": -74.09382864832878
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1084.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.96669999603182,
                          "lon": 23.716699965298176
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 682.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.83609998645261,
                          "lon": 124.37779993750155
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 900.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 21.52214442845434,
                          "lon": 65.61692216433585
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 8857.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5886.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.800999973900616,
                          "lon": 87.60049992240965
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 604.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -29.123000018298626,
                          "lon": 26.166199939325452
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.500000024214387,
                          "lon": -47.45960008352995
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T00:30:00.000Z",
                "key": 1602981000000,
                "doc_count": 669,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 235,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.13426848992388,
                          "lon": -116.87563834252192
                        },
                        "count": 235
                      },
                      "sum_of_destination.bytes": {
                        "value": 1702375.0
                      },
                      "sum_of_source.bytes": {
                        "value": 59742.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 199,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.34187182632916,
                          "lon": 117.90225524347669
                        },
                        "count": 199
                      },
                      "sum_of_destination.bytes": {
                        "value": 1060417.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232255.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 71,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.81978870764322,
                          "lon": 13.992516850711594
                        },
                        "count": 71
                      },
                      "sum_of_destination.bytes": {
                        "value": 22922.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14526.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 33,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 33
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2742.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 32,
                      "sourceCentroid": {
                        "location": {
                          "lat": -25.107375011430122,
                          "lon": -50.89431256055832
                        },
                        "count": 32
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1948.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.7411235492566925,
                          "lon": 108.3526881817071
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1496.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 33.51749998284504,
                          "lon": 29.29406245588325
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 992.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 876.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 23.447599981778435,
                          "lon": 72.20954279681402
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 19764.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13564.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 360.0
                      },
                      "sum_of_source.bytes": {
                        "value": 744.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 335.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.830500034615397,
                          "lon": -43.21920004673302
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 544.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 38.69749998673797,
                          "lon": -9.423100082203746
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 9948.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7228.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T00:45:00.000Z",
                "key": 1602981900000,
                "doc_count": 732,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 235,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.78944253402346,
                          "lon": -118.25654216855764
                        },
                        "count": 235
                      },
                      "sum_of_destination.bytes": {
                        "value": 1475881.0
                      },
                      "sum_of_source.bytes": {
                        "value": 62107.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 228,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.17994383036306,
                          "lon": 116.36908373207245
                        },
                        "count": 228
                      },
                      "sum_of_destination.bytes": {
                        "value": 589628.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272182.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 141,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.92177373810889,
                          "lon": 23.741970879640032
                        },
                        "count": 141
                      },
                      "sum_of_destination.bytes": {
                        "value": 19332.0
                      },
                      "sum_of_source.bytes": {
                        "value": 22122.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 37,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.6872702929115775,
                          "lon": 108.7606539985014
                        },
                        "count": 37
                      },
                      "sum_of_destination.bytes": {
                        "value": 52796.0
                      },
                      "sum_of_source.bytes": {
                        "value": 36136.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.50099997315556,
                          "lon": -73.58115000184625
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 804.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1266.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 14.463319977745414,
                          "lon": 77.3966799415648
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 14272.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9744.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.27389164082706,
                          "lon": -4.162258340511471
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 2909.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2934.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.512133304961026,
                          "lon": 83.91803327947855
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 894.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 22.751949972007424,
                          "lon": -74.096550042741
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 776.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.077099986374378,
                          "lon": 31.285899924114347
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T01:00:00.000Z",
                "key": 1602982800000,
                "doc_count": 801,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 273,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.84492159353385,
                          "lon": -118.83681689327643
                        },
                        "count": 273
                      },
                      "sum_of_destination.bytes": {
                        "value": 1728303.0
                      },
                      "sum_of_source.bytes": {
                        "value": 93025.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 225,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.19627641197294,
                          "lon": 115.6336199656129
                        },
                        "count": 225
                      },
                      "sum_of_destination.bytes": {
                        "value": 746612.0
                      },
                      "sum_of_source.bytes": {
                        "value": 271005.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 146,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.44854107265654,
                          "lon": 16.894124614151373
                        },
                        "count": 146
                      },
                      "sum_of_destination.bytes": {
                        "value": 37112.0
                      },
                      "sum_of_source.bytes": {
                        "value": 22416.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 27,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 27
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2220.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.90436397921294,
                          "lon": 68.33936394788324
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 9189.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7096.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.14243997819722,
                          "lon": 125.68365329504013
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 1232.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1750.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.810228595110987,
                          "lon": 108.1474570796958
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 14628.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10268.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.55734997987747,
                          "lon": -6.553550041280687
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 36218.0
                      },
                      "sum_of_source.bytes": {
                        "value": 23789.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 1444.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2136.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.97223332338035,
                          "lon": 23.722233306616545
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 736.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.473300016485155,
                          "lon": -46.665800074115396
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 360.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.49999997019768,
                          "lon": -73.58330000191927
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 268.0
                      },
                      "sum_of_source.bytes": {
                        "value": 298.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -8.050000006332994,
                          "lon": -34.9000000488013
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 1,
                      "sourceCentroid": {
                        "location": {
                          "lat": 60.934399967081845,
                          "lon": 76.55309999361634
                        },
                        "count": 1
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 62.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T01:15:00.000Z",
                "key": 1602983700000,
                "doc_count": 785,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 283,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.246571712123476,
                          "lon": -115.4199042817242
                        },
                        "count": 283
                      },
                      "sum_of_destination.bytes": {
                        "value": 1156676.0
                      },
                      "sum_of_source.bytes": {
                        "value": 68197.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 209,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.371117191977408,
                          "lon": 117.24544254710906
                        },
                        "count": 209
                      },
                      "sum_of_destination.bytes": {
                        "value": 380044.0
                      },
                      "sum_of_source.bytes": {
                        "value": 285599.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 143,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.16656361169253,
                          "lon": 19.09014541141272
                        },
                        "count": 143
                      },
                      "sum_of_destination.bytes": {
                        "value": 45337.0
                      },
                      "sum_of_source.bytes": {
                        "value": 26231.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 35,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 35
                      },
                      "sum_of_destination.bytes": {
                        "value": 1176.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3014.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 27,
                      "sourceCentroid": {
                        "location": {
                          "lat": 38.308211104013026,
                          "lon": 24.51397404074669
                        },
                        "count": 27
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1662.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.728614261240832,
                          "lon": 63.898071384589585
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 16085.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10670.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.194899980095215,
                          "lon": -2.410637531429529
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 11380.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7192.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.491207672712896,
                          "lon": -6.77428465981323
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 18439.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14234.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 7.678109059448946,
                          "lon": -78.474363704974
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 662.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 544.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.95609999354929,
                          "lon": 85.95499997958541
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.830500034615397,
                          "lon": -43.21920004673302
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 544.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -27.330600013956428,
                          "lon": -55.86670001037419
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 544.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 10708.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6148.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T01:30:00.000Z",
                "key": 1602984600000,
                "doc_count": 781,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 243,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.742950585153366,
                          "lon": 116.3103835032908
                        },
                        "count": 243
                      },
                      "sum_of_destination.bytes": {
                        "value": 651762.0
                      },
                      "sum_of_source.bytes": {
                        "value": 299212.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 235,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.848173597015126,
                          "lon": -117.7790647292153
                        },
                        "count": 235
                      },
                      "sum_of_destination.bytes": {
                        "value": 2174966.0
                      },
                      "sum_of_source.bytes": {
                        "value": 73065.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 155,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.90419674995205,
                          "lon": 18.552755442718343
                        },
                        "count": 155
                      },
                      "sum_of_destination.bytes": {
                        "value": 60773.0
                      },
                      "sum_of_source.bytes": {
                        "value": 36721.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 728.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2542.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.415230032987893,
                          "lon": 104.89119996596128
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 12649.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10182.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": 22.75467220460996,
                          "lon": 69.7495943820104
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 18641.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12206.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.70908821396091,
                          "lon": -6.047158857588382
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 18059.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13602.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.919542839218465,
                          "lon": 31.763028518429824
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 1120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1472.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -30.388160032220185,
                          "lon": -53.426020028069615
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 640.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72139998432249,
                          "lon": -74.00520008057356
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 604.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 0.0,
                          "lon": 24.99999993480742
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.44999998062849,
                          "lon": 65.3332999907434
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.04859996866435,
                          "lon": -123.21970003657043
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T01:45:00.000Z",
                "key": 1602985500000,
                "doc_count": 790,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 256,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.13672732490522,
                          "lon": -120.28094458652049
                        },
                        "count": 256
                      },
                      "sum_of_destination.bytes": {
                        "value": 1610613.0
                      },
                      "sum_of_source.bytes": {
                        "value": 111664.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 211,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.784460632373264,
                          "lon": 115.15948763461475
                        },
                        "count": 211
                      },
                      "sum_of_destination.bytes": {
                        "value": 608279.0
                      },
                      "sum_of_source.bytes": {
                        "value": 240571.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 154,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.16310841761312,
                          "lon": 16.39922267406598
                        },
                        "count": 154
                      },
                      "sum_of_destination.bytes": {
                        "value": 118690.0
                      },
                      "sum_of_source.bytes": {
                        "value": 60345.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 36,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.94006387190893,
                          "lon": -74.35550838476047
                        },
                        "count": 36
                      },
                      "sum_of_destination.bytes": {
                        "value": 58869.0
                      },
                      "sum_of_source.bytes": {
                        "value": 38529.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 26,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.601776933010954,
                          "lon": 55.64422301016748
                        },
                        "count": 26
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2628.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.45999521549259,
                          "lon": -75.78679053911141
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1238.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 16.882474991725758,
                          "lon": 75.3575249388814
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 34055.0
                      },
                      "sum_of_source.bytes": {
                        "value": 23142.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.81530497781932,
                          "lon": -5.692685029003769
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 18227.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14358.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 832.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 32.846939988434315,
                          "lon": 32.90309992991388
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 604.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.993100019171834,
                          "lon": 110.42079993523657
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 816.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.60330003872514,
                          "lon": -58.38170003145933
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T02:00:00.000Z",
                "key": 1602986400000,
                "doc_count": 2046,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1594,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.37050839478075,
                          "lon": -121.37287288352641
                        },
                        "count": 1594
                      },
                      "sum_of_destination.bytes": {
                        "value": 9358947.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1523586.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 248,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.789104002261265,
                          "lon": 116.73974875649888
                        },
                        "count": 248
                      },
                      "sum_of_destination.bytes": {
                        "value": 925280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 288285.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 52,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.89350575479106,
                          "lon": 17.519990329523214
                        },
                        "count": 52
                      },
                      "sum_of_destination.bytes": {
                        "value": 15084.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9680.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 27,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.79667034558952,
                          "lon": 71.9847703135262
                        },
                        "count": 27
                      },
                      "sum_of_destination.bytes": {
                        "value": 12042.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8316.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.643599981907755,
                          "lon": 18.81104497052729
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 18963.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11841.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.980733301490545,
                          "lon": -76.78576666861773
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 864.0
                      },
                      "sum_of_source.bytes": {
                        "value": 944.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.49495879998978,
                          "lon": -74.8197118220303
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 616.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1010.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1176.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68799999076873,
                          "lon": 139.71455997414887
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.67554447054863,
                          "lon": 112.61179994791746
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 1232.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1480.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.84396664425731,
                          "lon": -5.5970333609730005
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 7519.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5818.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -19.350900035351515,
                          "lon": -42.23730007186532
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 268.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T02:15:00.000Z",
                "key": 1602987300000,
                "doc_count": 2050,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1554,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.370343617951086,
                          "lon": -121.41689670166095
                        },
                        "count": 1554
                      },
                      "sum_of_destination.bytes": {
                        "value": 9492111.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1532243.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 224,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.86972719896169,
                          "lon": 117.02101425342595
                        },
                        "count": 224
                      },
                      "sum_of_destination.bytes": {
                        "value": 360629.0
                      },
                      "sum_of_source.bytes": {
                        "value": 227998.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 110,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.793721791737795,
                          "lon": 21.870049955746666
                        },
                        "count": 110
                      },
                      "sum_of_destination.bytes": {
                        "value": 24920.0
                      },
                      "sum_of_source.bytes": {
                        "value": 16446.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72277616709471,
                          "lon": -74.04523815294462
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 16566.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10430.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1376.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.96669999603182,
                          "lon": 23.716699965298176
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1324.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.225983313284814,
                          "lon": -4.321622233837843
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 5538.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4936.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.207912469049916,
                          "lon": -75.38468750193715
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 752.0
                      },
                      "sum_of_source.bytes": {
                        "value": 828.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -16.373657159108138,
                          "lon": -56.51375719080014
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 852.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.794672741300681,
                          "lon": 109.46423634294082
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 748.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.51925453958525,
                          "lon": -0.6283000628040596
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 682.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -33.8612000271678,
                          "lon": 151.19819995947182
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.830500034615397,
                          "lon": -43.21920004673302
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 408.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.04859996866435,
                          "lon": -123.21970003657043
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.999999986961484,
                          "lon": 74.99999997206032
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 240.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T02:30:00.000Z",
                "key": 1602988200000,
                "doc_count": 2149,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1551,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.38216929871776,
                          "lon": -121.4180353799262
                        },
                        "count": 1551
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.0108066E7
                      },
                      "sum_of_source.bytes": {
                        "value": 1545985.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 246,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.575962163258072,
                          "lon": 116.07541459816986
                        },
                        "count": 246
                      },
                      "sum_of_destination.bytes": {
                        "value": 602221.0
                      },
                      "sum_of_source.bytes": {
                        "value": 329893.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 174,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.20145572290017,
                          "lon": 20.950512030033458
                        },
                        "count": 174
                      },
                      "sum_of_destination.bytes": {
                        "value": 39980.0
                      },
                      "sum_of_source.bytes": {
                        "value": 29907.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 34,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.942185290185186,
                          "lon": 25.523067610064412
                        },
                        "count": 34
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2368.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.781320018228143,
                          "lon": -53.82805338688195
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 19873.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12711.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 26,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.591007699401906,
                          "lon": 55.616692243000635
                        },
                        "count": 26
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2134.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 26.584374977101106,
                          "lon": 75.23124993313104
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1392.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.77231247816235,
                          "lon": -5.836162531049922
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 15362.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11792.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 1856.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3188.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 496.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.99999998882413,
                          "lon": 67.99999997019768
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 412.0
                      }
                    },
                    {
                      "key": "3/5/1",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 66.529999980703,
                          "lon": 66.60189994610846
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 408.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.88639997597784,
                          "lon": -78.87810003943741
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1368.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 10708.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6148.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72139998432249,
                          "lon": -74.00520008057356
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T02:45:00.000Z",
                "key": 1602989100000,
                "doc_count": 867,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 273,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.847612788706282,
                          "lon": 115.92254135798622
                        },
                        "count": 273
                      },
                      "sum_of_destination.bytes": {
                        "value": 951112.0
                      },
                      "sum_of_source.bytes": {
                        "value": 346358.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 238,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.31291174261338,
                          "lon": -117.6144773603863
                        },
                        "count": 238
                      },
                      "sum_of_destination.bytes": {
                        "value": 1518070.0
                      },
                      "sum_of_source.bytes": {
                        "value": 81874.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 130,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.09428689875998,
                          "lon": 19.05152995648006
                        },
                        "count": 130
                      },
                      "sum_of_destination.bytes": {
                        "value": 29736.0
                      },
                      "sum_of_source.bytes": {
                        "value": 18488.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 54,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 54
                      },
                      "sum_of_destination.bytes": {
                        "value": 9008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13652.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 23,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174713068884676,
                          "lon": 106.8289825571296
                        },
                        "count": 23
                      },
                      "sum_of_destination.bytes": {
                        "value": 17910.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11348.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.56517726563933,
                          "lon": 25.59926814060997
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1344.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.00211427560342,
                          "lon": -76.06025718684707
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1290.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 16.152405237386887,
                          "lon": 77.11264203939783
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 11268.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7138.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.70908821396091,
                          "lon": -6.047158857588382
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 18327.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14374.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.55858574328678,
                          "lon": -47.71637860951679
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 24093.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14207.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1012.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -9.969840025529265,
                          "lon": -40.01346004195511
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 916.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.509114261716604,
                          "lon": -0.1014714754585709
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 414.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.44999998062849,
                          "lon": 65.3332999907434
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.0500000230968,
                          "lon": 27.96669996343553
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 696.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.90149996988475,
                          "lon": -122.18440004624426
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T03:00:00.000Z",
                "key": 1602990000000,
                "doc_count": 729,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 247,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.319259887297264,
                          "lon": 115.98964773883915
                        },
                        "count": 247
                      },
                      "sum_of_destination.bytes": {
                        "value": 882827.0
                      },
                      "sum_of_source.bytes": {
                        "value": 362189.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 234,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.46448202950593,
                          "lon": -114.40988295496656
                        },
                        "count": 234
                      },
                      "sum_of_destination.bytes": {
                        "value": 1774336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 76848.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 100,
                      "sourceCentroid": {
                        "location": {
                          "lat": 48.94078498142771,
                          "lon": 12.62933394536376
                        },
                        "count": 100
                      },
                      "sum_of_destination.bytes": {
                        "value": 13476.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13306.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.607320010662079,
                          "lon": 55.63747993670404
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 1064.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2576.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.097233324777335,
                          "lon": 23.932595798978582
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1536.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.948190885849975,
                          "lon": -5.249209113588387
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 15866.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12586.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174520019441843,
                          "lon": 106.82923993840814
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 5113.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3116.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.63834207132459,
                          "lon": -73.93724216834495
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1150.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.81469999230467,
                          "lon": -106.13972501596436
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 1264.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": -19.906371434751367,
                          "lon": -48.837085774700554
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 60.0
                      },
                      "sum_of_source.bytes": {
                        "value": 496.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 11.912059977650642,
                          "lon": 79.86463996767998
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 608.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.49999997019768,
                          "lon": -73.58330000191927
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 10708.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6148.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 2,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 2
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 124.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T03:15:00.000Z",
                "key": 1602990900000,
                "doc_count": 707,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 236,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.0439669187378,
                          "lon": 114.33853766754649
                        },
                        "count": 236
                      },
                      "sum_of_destination.bytes": {
                        "value": 494567.0
                      },
                      "sum_of_source.bytes": {
                        "value": 333013.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 227,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.96613477971733,
                          "lon": -115.55711282109472
                        },
                        "count": 227
                      },
                      "sum_of_destination.bytes": {
                        "value": 1650592.0
                      },
                      "sum_of_source.bytes": {
                        "value": 84033.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 65,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.93459689631485,
                          "lon": 22.392589192694196
                        },
                        "count": 65
                      },
                      "sum_of_destination.bytes": {
                        "value": 12812.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8874.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 38,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.542239461069634,
                          "lon": 27.853149966042686
                        },
                        "count": 38
                      },
                      "sum_of_destination.bytes": {
                        "value": 784.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2548.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.96464734504882,
                          "lon": -5.19428949558029
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 13013.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10208.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": 33.83610553108156,
                          "lon": -71.95058895274997
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1104.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1666.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 19.05623843965049,
                          "lon": 74.52443072858911
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 688.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1152.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 1672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1420.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.504490880126305,
                          "lon": -0.10908185165714133
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 616.0
                      },
                      "sum_of_source.bytes": {
                        "value": 638.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": -14.080244456417859,
                          "lon": -55.61077783815563
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 300.0
                      },
                      "sum_of_source.bytes": {
                        "value": 892.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.31039999704808,
                          "lon": -78.23960001580417
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 522.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T03:30:00.000Z",
                "key": 1602991800000,
                "doc_count": 962,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 270,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.915510348665215,
                          "lon": -118.42399042099714
                        },
                        "count": 270
                      },
                      "sum_of_destination.bytes": {
                        "value": 2574994.0
                      },
                      "sum_of_source.bytes": {
                        "value": 90259.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 235,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.445504292350343,
                          "lon": -47.2666311004853
                        },
                        "count": 235
                      },
                      "sum_of_destination.bytes": {
                        "value": 824371.0
                      },
                      "sum_of_source.bytes": {
                        "value": 564041.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 176,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.91498405910203,
                          "lon": 116.20630053475246
                        },
                        "count": 176
                      },
                      "sum_of_destination.bytes": {
                        "value": 406636.0
                      },
                      "sum_of_source.bytes": {
                        "value": 215501.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 123,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.34233900856954,
                          "lon": 14.720514592055867
                        },
                        "count": 123
                      },
                      "sum_of_destination.bytes": {
                        "value": 1568.0
                      },
                      "sum_of_source.bytes": {
                        "value": 25672.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 38,
                      "sourceCentroid": {
                        "location": {
                          "lat": 38.26408682587115,
                          "lon": -77.1763553360085
                        },
                        "count": 38
                      },
                      "sum_of_destination.bytes": {
                        "value": 15393.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11421.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 31,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.591816091369235,
                          "lon": 50.69082255835735
                        },
                        "count": 31
                      },
                      "sum_of_destination.bytes": {
                        "value": 1264.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1748.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 28,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.96669999603182,
                          "lon": 23.716699965298176
                        },
                        "count": 28
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2546.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1354.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 38.5912368211307,
                          "lon": -5.586563181622248
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 13117.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10046.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.99999998882413,
                          "lon": 67.99999997019768
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 340.0
                      }
                    },
                    {
                      "key": "3/2/5",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -41.1500000115484,
                          "lon": -71.30000000819564
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.249200018122792,
                          "lon": 112.75079995393753
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T03:45:00.000Z",
                "key": 1602992700000,
                "doc_count": 740,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 248,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.216807228107488,
                          "lon": 114.80032052964934
                        },
                        "count": 248
                      },
                      "sum_of_destination.bytes": {
                        "value": 728372.0
                      },
                      "sum_of_source.bytes": {
                        "value": 344844.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 197,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.09912079192585,
                          "lon": -119.95166909081985
                        },
                        "count": 197
                      },
                      "sum_of_destination.bytes": {
                        "value": 1619012.0
                      },
                      "sum_of_source.bytes": {
                        "value": 79553.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 136,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.04606615324669,
                          "lon": 22.037551423178655
                        },
                        "count": 136
                      },
                      "sum_of_destination.bytes": {
                        "value": 14068.0
                      },
                      "sum_of_source.bytes": {
                        "value": 18192.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 26,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 26
                      },
                      "sum_of_destination.bytes": {
                        "value": 7104.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3108.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.52094164479058,
                          "lon": -74.12967090960592
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1482.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 17.252123782278172,
                          "lon": 74.65923803326275
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 13545.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12108.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1718.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.131575021194294,
                          "lon": 108.99287498323247
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 1120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1768.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.517618163488805,
                          "lon": -0.41880003176629543
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 682.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.230900017544627,
                          "lon": 28.058299999684095
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -15.19480002578348,
                          "lon": -44.126700069755316
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.55849995929748,
                          "lon": 17.807699963450432
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 240.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.60330003872514,
                          "lon": -58.38170003145933
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 1,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 1
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 62.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T04:00:00.000Z",
                "key": 1602993600000,
                "doc_count": 831,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 226,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.76157386212783,
                          "lon": 117.16995262058732
                        },
                        "count": 226
                      },
                      "sum_of_destination.bytes": {
                        "value": 730225.0
                      },
                      "sum_of_source.bytes": {
                        "value": 235209.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 207,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.435093215423755,
                          "lon": -117.75723966364951
                        },
                        "count": 207
                      },
                      "sum_of_destination.bytes": {
                        "value": 2043429.0
                      },
                      "sum_of_source.bytes": {
                        "value": 75453.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 116,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.400372390964485,
                          "lon": 22.17169478045905
                        },
                        "count": 116
                      },
                      "sum_of_destination.bytes": {
                        "value": 3640.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10138.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 71,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.09919011570566,
                          "lon": -77.57611694824423
                        },
                        "count": 71
                      },
                      "sum_of_destination.bytes": {
                        "value": 1792.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4476.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 31,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.00997418994385,
                          "lon": 25.518216086972146
                        },
                        "count": 31
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2438.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 31,
                      "sourceCentroid": {
                        "location": {
                          "lat": -27.432532272181444,
                          "lon": -51.84028712521878
                        },
                        "count": 31
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2510.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 28,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.600457152617829,
                          "lon": 55.64582850384925
                        },
                        "count": 28
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1952.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.254733347450383,
                          "lon": 107.10902496124618
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1972.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.05892914254218,
                          "lon": -4.879645850742236
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 12789.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10280.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 864.0
                      },
                      "sum_of_source.bytes": {
                        "value": 960.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.62192304432392,
                          "lon": 62.343830741368805
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 866.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.634399980306625,
                          "lon": -122.34220001846552
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 536.0
                      },
                      "sum_of_source.bytes": {
                        "value": 596.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.11719999369234,
                          "lon": 61.62819997407496
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.639299985952675,
                          "lon": -84.08830001950264
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 360.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.879999998025596,
                          "lon": 125.32279992476106
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T04:15:00.000Z",
                "key": 1602994500000,
                "doc_count": 702,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 244,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.85059996824864,
                          "lon": 115.73486513000165
                        },
                        "count": 244
                      },
                      "sum_of_destination.bytes": {
                        "value": 852772.0
                      },
                      "sum_of_source.bytes": {
                        "value": 306980.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 188,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.00506380821103,
                          "lon": -117.96728622004825
                        },
                        "count": 188
                      },
                      "sum_of_destination.bytes": {
                        "value": 1366673.0
                      },
                      "sum_of_source.bytes": {
                        "value": 61595.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 106,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.28396506985333,
                          "lon": 25.40276222519647
                        },
                        "count": 106
                      },
                      "sum_of_destination.bytes": {
                        "value": 3304.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8246.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 47,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.194282953211285,
                          "lon": -81.31483619576915
                        },
                        "count": 47
                      },
                      "sum_of_destination.bytes": {
                        "value": 1956.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2882.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 864.0
                      },
                      "sum_of_source.bytes": {
                        "value": 960.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.81024703668321,
                          "lon": -5.709564735126846
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 16054.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12532.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.620253858514703,
                          "lon": 55.62174609862268
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1238.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 22.308999970197103,
                          "lon": 77.66580764634105
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 836.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 656.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.45974001660943,
                          "lon": -46.58204006776214
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 588.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": -33.494000039063394,
                          "lon": 143.21039996109903
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 616.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 6.453099972568452,
                          "lon": 3.395799994468689
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 408.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.66669996641576,
                          "lon": -79.41670001484454
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T04:30:00.000Z",
                "key": 1602995400000,
                "doc_count": 639,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 196,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.32798365488344,
                          "lon": -117.2179306661045
                        },
                        "count": 196
                      },
                      "sum_of_destination.bytes": {
                        "value": 1930525.0
                      },
                      "sum_of_source.bytes": {
                        "value": 71653.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 165,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.202587847851895,
                          "lon": 116.14162663505836
                        },
                        "count": 165
                      },
                      "sum_of_destination.bytes": {
                        "value": 495007.0
                      },
                      "sum_of_source.bytes": {
                        "value": 213139.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 111,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.59850177936558,
                          "lon": 14.508235085050803
                        },
                        "count": 111
                      },
                      "sum_of_destination.bytes": {
                        "value": 19198.0
                      },
                      "sum_of_source.bytes": {
                        "value": 17094.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 31,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.97191289382717,
                          "lon": 26.08149350470593
                        },
                        "count": 31
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2090.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 23.999936343382366,
                          "lon": 72.33609994450076
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1704.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.779470605885281,
                          "lon": 109.8385411161272
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 2576.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3112.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 968.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.208599978592247,
                          "lon": -2.842000024393201
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1140.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.52379089797085,
                          "lon": -0.35341823812235484
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 662.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.77109998604283,
                          "lon": 125.04139994736761
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 900.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.631340013816953,
                          "lon": 55.6082599516958
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 542.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.57253330480307,
                          "lon": -74.21466674655676
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 534.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.08459996711463,
                          "lon": -88.03590006195009
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T04:45:00.000Z",
                "key": 1602996300000,
                "doc_count": 833,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 382,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.336525899487306,
                          "lon": -118.12210789913341
                        },
                        "count": 382
                      },
                      "sum_of_destination.bytes": {
                        "value": 2200895.0
                      },
                      "sum_of_source.bytes": {
                        "value": 226019.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 191,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.981825623568636,
                          "lon": 114.09970048795508
                        },
                        "count": 191
                      },
                      "sum_of_destination.bytes": {
                        "value": 528149.0
                      },
                      "sum_of_source.bytes": {
                        "value": 261749.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 109,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.98484860340116,
                          "lon": 20.11413388765938
                        },
                        "count": 109
                      },
                      "sum_of_destination.bytes": {
                        "value": 13788.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14216.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 42,
                      "sourceCentroid": {
                        "location": {
                          "lat": 22.162297590569192,
                          "lon": 73.15287137869745
                        },
                        "count": 42
                      },
                      "sum_of_destination.bytes": {
                        "value": 2632.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4500.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1758.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 33.30952352104599,
                          "lon": 28.151523487313707
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1078.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1354.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -27.84115001326427,
                          "lon": -57.90805004071444
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 756.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -8.398836372335525,
                          "lon": 114.87962724810296
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 1232.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1496.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.575177752412856,
                          "lon": -75.80770004540682
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 538.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68999999668449,
                          "lon": 139.68999995850027
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T05:00:00.000Z",
                "key": 1602997200000,
                "doc_count": 2253,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1531,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.383294828825555,
                          "lon": -121.72704080603336
                        },
                        "count": 1531
                      },
                      "sum_of_destination.bytes": {
                        "value": 9950869.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1545992.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 230,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.59795344764691,
                          "lon": 116.78525387799448
                        },
                        "count": 230
                      },
                      "sum_of_destination.bytes": {
                        "value": 265907.0
                      },
                      "sum_of_source.bytes": {
                        "value": 206819.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 227,
                      "sourceCentroid": {
                        "location": {
                          "lat": 14.401613623191016,
                          "lon": -79.23173349576342
                        },
                        "count": 227
                      },
                      "sum_of_destination.bytes": {
                        "value": 60742.0
                      },
                      "sum_of_source.bytes": {
                        "value": 46826.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 91,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.410752720179055,
                          "lon": 22.605275775377567
                        },
                        "count": 91
                      },
                      "sum_of_destination.bytes": {
                        "value": 19169.0
                      },
                      "sum_of_source.bytes": {
                        "value": 17973.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 34,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.861764677581103,
                          "lon": 70.11665876763051
                        },
                        "count": 34
                      },
                      "sum_of_destination.bytes": {
                        "value": 1064.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2188.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.10618236940354,
                          "lon": -65.77949414303636
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1086.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.96669999603182,
                          "lon": 23.716699965298176
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 992.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1664.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.90261535590085,
                          "lon": -3.9015692415145726
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1076.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -21.189200012013316,
                          "lon": -42.61960005853325
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 744.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 2068.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1298.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.51408179663122,
                          "lon": -0.3694000281393528
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 682.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.814079981297255,
                          "lon": 73.39825995080173
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.230900017544627,
                          "lon": 28.058299999684095
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/7/5",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -41.000000028871,
                          "lon": 173.9999999385327
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 12145.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8790.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.39999998733401,
                          "lon": 128.1332999188453
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T05:15:00.000Z",
                "key": 1602998100000,
                "doc_count": 2108,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1563,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.334008497765176,
                          "lon": -121.46438840399504
                        },
                        "count": 1563
                      },
                      "sum_of_destination.bytes": {
                        "value": 9879141.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1545480.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 252,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.527722984352813,
                          "lon": 116.5588698083801
                        },
                        "count": 252
                      },
                      "sum_of_destination.bytes": {
                        "value": 707522.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348129.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 83,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.38310358887651,
                          "lon": 22.294944532058505
                        },
                        "count": 83
                      },
                      "sum_of_destination.bytes": {
                        "value": 1736.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5776.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.603316676802933,
                          "lon": 55.64234993420541
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2294.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.42202998744324,
                          "lon": 25.67337994929403
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1878.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.21669998485595,
                          "lon": 117.54999993368983
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 59313.0
                      },
                      "sum_of_source.bytes": {
                        "value": 37667.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.30704703538076,
                          "lon": -74.17752948041786
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 13769.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8125.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.535649984143674,
                          "lon": -0.0865000463090837
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 16398.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9818.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -24.96794287913612,
                          "lon": -51.66250002437404
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 24093.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14149.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 19.397249969188124,
                          "lon": 79.11850828444585
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 774.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 720.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -18.442863654345274,
                          "lon": -41.06661822562191
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 1568.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1880.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.07927996851504,
                          "lon": -4.2496800273656845
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 56.0
                      },
                      "sum_of_source.bytes": {
                        "value": 674.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174733359366655,
                          "lon": 106.82895550504327
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 884.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 3,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.99999998882413,
                          "lon": 67.99999997019768
                        },
                        "count": 3
                      },
                      "sum_of_destination.bytes": {
                        "value": 168.0
                      },
                      "sum_of_source.bytes": {
                        "value": 200.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T05:30:00.000Z",
                "key": 1602999000000,
                "doc_count": 2014,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1496,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.27171837080166,
                          "lon": -121.22601589040437
                        },
                        "count": 1496
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.0124752E7
                      },
                      "sum_of_source.bytes": {
                        "value": 1469012.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 234,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.238485013134778,
                          "lon": 115.90469312925751
                        },
                        "count": 234
                      },
                      "sum_of_destination.bytes": {
                        "value": 694239.0
                      },
                      "sum_of_source.bytes": {
                        "value": 267866.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 107,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.72294576826427,
                          "lon": 19.872349478286978
                        },
                        "count": 107
                      },
                      "sum_of_destination.bytes": {
                        "value": 45788.0
                      },
                      "sum_of_source.bytes": {
                        "value": 32850.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 43,
                      "sourceCentroid": {
                        "location": {
                          "lat": 20.785823227881,
                          "lon": 77.42753483744902
                        },
                        "count": 43
                      },
                      "sum_of_destination.bytes": {
                        "value": 16790.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12138.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 29,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.28602066979711,
                          "lon": 30.452279270273344
                        },
                        "count": 29
                      },
                      "sum_of_destination.bytes": {
                        "value": 17041.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12799.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 23,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.34782607667148,
                          "lon": 70.5826086482114
                        },
                        "count": 23
                      },
                      "sum_of_destination.bytes": {
                        "value": 5138.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4646.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 26.890427249229766,
                          "lon": -72.52421825108203
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 13321.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10310.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 992.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1006.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.9222000148147345,
                          "lon": 107.60689998976886
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -19.988800040446222,
                          "lon": -43.85080000385642
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T05:45:00.000Z",
                "key": 1602999900000,
                "doc_count": 828,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 256,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.437663641143445,
                          "lon": 115.36178746609949
                        },
                        "count": 256
                      },
                      "sum_of_destination.bytes": {
                        "value": 570165.0
                      },
                      "sum_of_source.bytes": {
                        "value": 356447.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 209,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.59133586364143,
                          "lon": -117.55125651051375
                        },
                        "count": 209
                      },
                      "sum_of_destination.bytes": {
                        "value": 1583526.0
                      },
                      "sum_of_source.bytes": {
                        "value": 66583.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 126,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.763306323305834,
                          "lon": 20.747072181797453
                        },
                        "count": 126
                      },
                      "sum_of_destination.bytes": {
                        "value": 3108.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10162.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 64,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.46821247343905,
                          "lon": -76.60845004837029
                        },
                        "count": 64
                      },
                      "sum_of_destination.bytes": {
                        "value": 66519.0
                      },
                      "sum_of_source.bytes": {
                        "value": 45526.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 28,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.88525354230244,
                          "lon": 60.0429106633445
                        },
                        "count": 28
                      },
                      "sum_of_destination.bytes": {
                        "value": 1288.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2268.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 26,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.606396164386892,
                          "lon": 55.63860378228128
                        },
                        "count": 26
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2548.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.31430474815092,
                          "lon": 28.56430472939142
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1290.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.412200018297881,
                          "lon": 111.02304994594306
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 1120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1360.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -11.262340013869107,
                          "lon": 33.31333999335766
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 596.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 558.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.34062220156193,
                          "lon": -75.93176668509841
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1044.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.516700002364814,
                          "lon": -46.88330006785691
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T06:00:00.000Z",
                "key": 1603000800000,
                "doc_count": 719,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 252,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.85012021341494,
                          "lon": -118.33326434051352
                        },
                        "count": 252
                      },
                      "sum_of_destination.bytes": {
                        "value": 2228443.0
                      },
                      "sum_of_source.bytes": {
                        "value": 104472.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 177,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.90281465646448,
                          "lon": 117.04764968826105
                        },
                        "count": 177
                      },
                      "sum_of_destination.bytes": {
                        "value": 403553.0
                      },
                      "sum_of_source.bytes": {
                        "value": 255693.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 117,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.38516921084374,
                          "lon": 14.827687127085833
                        },
                        "count": 117
                      },
                      "sum_of_destination.bytes": {
                        "value": 13996.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14448.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 50,
                      "sourceCentroid": {
                        "location": {
                          "lat": 17.613661966100334,
                          "lon": 77.60070593040436
                        },
                        "count": 50
                      },
                      "sum_of_destination.bytes": {
                        "value": 3528.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5218.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 392.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1618.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72139998432249,
                          "lon": -74.00520008057356
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 16062.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9594.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -18.250000001862645,
                          "lon": 34.999999925494194
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 696.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.96669999603182,
                          "lon": 23.716699965298176
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.65060004033148,
                          "lon": -58.382200011983514
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.634399980306625,
                          "lon": -122.34220001846552
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 268.0
                      },
                      "sum_of_source.bytes": {
                        "value": 298.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.66179996356368,
                          "lon": 139.7411999758333
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 300.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.800999973900616,
                          "lon": 87.60049992240965
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 640.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.88639997597784,
                          "lon": -78.87810003943741
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.91669996455312,
                          "lon": 106.91669996827841
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T06:15:00.000Z",
                "key": 1603001700000,
                "doc_count": 737,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 269,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.09546540093827,
                          "lon": -117.77455172290313
                        },
                        "count": 269
                      },
                      "sum_of_destination.bytes": {
                        "value": 1444033.0
                      },
                      "sum_of_source.bytes": {
                        "value": 74568.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 216,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.46493561662889,
                          "lon": 118.02398329484276
                        },
                        "count": 216
                      },
                      "sum_of_destination.bytes": {
                        "value": 737932.0
                      },
                      "sum_of_source.bytes": {
                        "value": 334572.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 110,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.472698161590166,
                          "lon": 14.211861756376244
                        },
                        "count": 110
                      },
                      "sum_of_destination.bytes": {
                        "value": 44636.0
                      },
                      "sum_of_source.bytes": {
                        "value": 31200.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 47,
                      "sourceCentroid": {
                        "location": {
                          "lat": 21.41897869227018,
                          "lon": 77.65130634023312
                        },
                        "count": 47
                      },
                      "sum_of_destination.bytes": {
                        "value": 3752.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5330.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.310292883643082,
                          "lon": 108.1179142477257
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 12289.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7031.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 58.43907271088524,
                          "lon": -11.958354598927228
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 682.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72139998432249,
                          "lon": -74.00520008057356
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 18675.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10735.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 890.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": -19.563300018198788,
                          "lon": -65.00580000691116
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 27368.0
                      },
                      "sum_of_source.bytes": {
                        "value": 18168.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.976899987086654,
                          "lon": 138.38309998624027
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.21669998951256,
                          "lon": 102.76669993065298
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.96669999603182,
                          "lon": 23.716699965298176
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T06:30:00.000Z",
                "key": 1603002600000,
                "doc_count": 831,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 281,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.166303526586937,
                          "lon": 116.19302060186624
                        },
                        "count": 281
                      },
                      "sum_of_destination.bytes": {
                        "value": 830398.0
                      },
                      "sum_of_source.bytes": {
                        "value": 381295.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 247,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.23142831517678,
                          "lon": -117.81596280713585
                        },
                        "count": 247
                      },
                      "sum_of_destination.bytes": {
                        "value": 1910934.0
                      },
                      "sum_of_source.bytes": {
                        "value": 85246.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 165,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.308263611725785,
                          "lon": 21.375888438048687
                        },
                        "count": 165
                      },
                      "sum_of_destination.bytes": {
                        "value": 39699.0
                      },
                      "sum_of_source.bytes": {
                        "value": 29872.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.92142634211402,
                          "lon": -51.46255794226339
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1202.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.187977756373584,
                          "lon": -76.75377782434225
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 26629.0
                      },
                      "sum_of_source.bytes": {
                        "value": 16611.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 20.95936871424783,
                          "lon": 70.01039372000378
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 1344.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1904.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.95397498877719,
                          "lon": 27.84224997041747
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 992.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.421321447539542,
                          "lon": 108.31892138613122
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 932.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1068.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 696.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.745399984531105,
                          "lon": -73.46280000172555
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 408.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T06:45:00.000Z",
                "key": 1603003500000,
                "doc_count": 830,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 246,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.15208086166985,
                          "lon": 115.68618370401786
                        },
                        "count": 246
                      },
                      "sum_of_destination.bytes": {
                        "value": 640070.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372092.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 235,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.614366360801334,
                          "lon": -117.24673962628746
                        },
                        "count": 235
                      },
                      "sum_of_destination.bytes": {
                        "value": 1111182.0
                      },
                      "sum_of_source.bytes": {
                        "value": 57561.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 146,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.05215682732324,
                          "lon": 24.116445843717212
                        },
                        "count": 146
                      },
                      "sum_of_destination.bytes": {
                        "value": 34692.0
                      },
                      "sum_of_source.bytes": {
                        "value": 27766.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 33,
                      "sourceCentroid": {
                        "location": {
                          "lat": 23.12576664400033,
                          "lon": 74.66393630189651
                        },
                        "count": 33
                      },
                      "sum_of_destination.bytes": {
                        "value": 16030.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12896.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 33,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.88646967023272,
                          "lon": -78.87830912220207
                        },
                        "count": 33
                      },
                      "sum_of_destination.bytes": {
                        "value": 4367.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5786.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.00508998520672,
                          "lon": 24.69512330275029
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2366.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1934.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.94215883292696,
                          "lon": -48.70538827031851
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 13725.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8429.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.935149979544804,
                          "lon": -78.3458000596147
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 1794.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2670.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1000.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.49999998975545,
                          "lon": -0.5833000782877207
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 48.4332999587059,
                          "lon": 114.86669993028045
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T07:00:00.000Z",
                "key": 1603004400000,
                "doc_count": 651,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 185,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.22656754562883,
                          "lon": -118.99603789244351
                        },
                        "count": 185
                      },
                      "sum_of_destination.bytes": {
                        "value": 1782393.0
                      },
                      "sum_of_source.bytes": {
                        "value": 64050.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 180,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.396016633836553,
                          "lon": 115.55974218249321
                        },
                        "count": 180
                      },
                      "sum_of_destination.bytes": {
                        "value": 668412.0
                      },
                      "sum_of_source.bytes": {
                        "value": 225542.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 101,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.3136385906543,
                          "lon": 21.51355241858723
                        },
                        "count": 101
                      },
                      "sum_of_destination.bytes": {
                        "value": 2816.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7904.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 57,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.59456664093427,
                          "lon": -74.88195442398519
                        },
                        "count": 57
                      },
                      "sum_of_destination.bytes": {
                        "value": 61196.0
                      },
                      "sum_of_source.bytes": {
                        "value": 38450.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": 23.515999970957637,
                          "lon": 71.88771993108094
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2004.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 29,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.645420705321534,
                          "lon": 55.59113099496683
                        },
                        "count": 29
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2368.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 33.27231427255486,
                          "lon": 31.15162851688053
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1016.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.58750002551824,
                          "lon": -58.67250001989305
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 540.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.66829998791218,
                          "lon": -79.42050003446639
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T07:15:00.000Z",
                "key": 1603005300000,
                "doc_count": 852,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 287,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.32274770454377,
                          "lon": 114.08391042187395
                        },
                        "count": 287
                      },
                      "sum_of_destination.bytes": {
                        "value": 530950.0
                      },
                      "sum_of_source.bytes": {
                        "value": 335951.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 235,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.10757912824208,
                          "lon": -120.05389877888275
                        },
                        "count": 235
                      },
                      "sum_of_destination.bytes": {
                        "value": 1714746.0
                      },
                      "sum_of_source.bytes": {
                        "value": 69751.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 111,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.979324305757274,
                          "lon": 22.50002067913679
                        },
                        "count": 111
                      },
                      "sum_of_destination.bytes": {
                        "value": 17201.0
                      },
                      "sum_of_source.bytes": {
                        "value": 18515.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 37,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 37
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2942.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 32,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.026590621389914,
                          "lon": 25.62554371281294
                        },
                        "count": 32
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1948.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.114690457603764,
                          "lon": -80.10210958309472
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1696.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.983233304694295,
                          "lon": 81.54601105023175
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1836.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.613200016851936,
                          "lon": 108.48407851997763
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 11893.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9094.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.44339997321367,
                          "lon": -0.1468000654131174
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 27730.0
                      },
                      "sum_of_source.bytes": {
                        "value": 25822.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.44559996621683,
                          "lon": -79.55775001086295
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 496.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -33.494000039063394,
                          "lon": 143.21039996109903
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 696.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -3.5000000009313226,
                          "lon": 29.999999972060323
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -12.043300028890371,
                          "lon": -77.02830000780523
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.879999998025596,
                          "lon": 125.32279992476106
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 464.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T07:30:00.000Z",
                "key": 1603006200000,
                "doc_count": 618,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 200,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.27628847921733,
                          "lon": -119.63635705159977
                        },
                        "count": 200
                      },
                      "sum_of_destination.bytes": {
                        "value": 2504585.0
                      },
                      "sum_of_source.bytes": {
                        "value": 70043.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 184,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.17311246866239,
                          "lon": 115.17462333466898
                        },
                        "count": 184
                      },
                      "sum_of_destination.bytes": {
                        "value": 511703.0
                      },
                      "sum_of_source.bytes": {
                        "value": 270990.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 76,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.32493682020638,
                          "lon": 24.145414424251374
                        },
                        "count": 76
                      },
                      "sum_of_destination.bytes": {
                        "value": 2464.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5670.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 31,
                      "sourceCentroid": {
                        "location": {
                          "lat": 21.876306424458182,
                          "lon": 77.27973865465292
                        },
                        "count": 31
                      },
                      "sum_of_destination.bytes": {
                        "value": 1176.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2764.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 28,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.365192863923896,
                          "lon": 55.99387850146741
                        },
                        "count": 28
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2256.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 28,
                      "sourceCentroid": {
                        "location": {
                          "lat": 26.26430713438562,
                          "lon": 28.817878548455024
                        },
                        "count": 28
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1772.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72139998432249,
                          "lon": -74.00520008057356
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 11324.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6850.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -21.29105002619326,
                          "lon": -47.36130001489073
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 300.0
                      },
                      "sum_of_source.bytes": {
                        "value": 930.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.73829997610301,
                          "lon": 91.38749993406236
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 816.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.52329996880144,
                          "lon": 49.41249995492399
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 960.0
                      },
                      "sum_of_source.bytes": {
                        "value": 420.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -5.429200041107833,
                          "lon": 105.26109999977052
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 544.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T07:45:00.000Z",
                "key": 1603007100000,
                "doc_count": 896,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 440,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.84417975836814,
                          "lon": -120.3032255048271
                        },
                        "count": 440
                      },
                      "sum_of_destination.bytes": {
                        "value": 3074790.0
                      },
                      "sum_of_source.bytes": {
                        "value": 339226.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 224,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.504897734499536,
                          "lon": 117.60697451540702
                        },
                        "count": 224
                      },
                      "sum_of_destination.bytes": {
                        "value": 631447.0
                      },
                      "sum_of_source.bytes": {
                        "value": 397303.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 111,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.813802678918314,
                          "lon": 19.61024769707709
                        },
                        "count": 111
                      },
                      "sum_of_destination.bytes": {
                        "value": 14684.0
                      },
                      "sum_of_source.bytes": {
                        "value": 16013.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.264263615350835,
                          "lon": -74.69742732630534
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 16062.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10274.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.189419026220484,
                          "lon": 61.39881424206708
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 1456.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2144.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.6649866476655,
                          "lon": 19.424926606938243
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 930.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -28.586936391551387,
                          "lon": -51.978063654493205
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 748.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.77214996283874,
                          "lon": -83.52195003535599
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 696.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/1/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -0.7500000391155481,
                          "lon": -90.31670006923378
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -8.050000006332994,
                          "lon": -34.9000000488013
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 2,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 2
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 336.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T08:00:00.000Z",
                "key": 1603008000000,
                "doc_count": 2108,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1558,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.377276111902866,
                          "lon": -121.6025143617164
                        },
                        "count": 1558
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.0224607E7
                      },
                      "sum_of_source.bytes": {
                        "value": 1529108.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 257,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.495002694641773,
                          "lon": 115.31338517333052
                        },
                        "count": 257
                      },
                      "sum_of_destination.bytes": {
                        "value": 535709.0
                      },
                      "sum_of_source.bytes": {
                        "value": 282358.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 101,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.432522752008744,
                          "lon": 18.79883560056955
                        },
                        "count": 101
                      },
                      "sum_of_destination.bytes": {
                        "value": 12250.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15260.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.03525602594018,
                          "lon": 106.54108396433294
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 2632.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3508.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.28685712428497,
                          "lon": -76.25700959137508
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 2054.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2790.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.571663144289666,
                          "lon": -3.660257928759644
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1162.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.61403155429779,
                          "lon": -109.59525794967224
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 1064.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1192.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1548.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 38.634799982537515,
                          "lon": 28.703974953386933
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 992.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 54.07289997674525,
                          "lon": 69.90459996275604
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 816.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -16.52680002618581,
                          "lon": 33.6746499594301
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 16062.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9630.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1160.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -12.109000017866492,
                          "lon": -59.879800049588084
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 896.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1316.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 19.99999998137355,
                          "lon": 76.99999993667006
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T08:15:00.000Z",
                "key": 1603008900000,
                "doc_count": 2064,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1518,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.28780611503774,
                          "lon": -121.55641322355467
                        },
                        "count": 1518
                      },
                      "sum_of_destination.bytes": {
                        "value": 9430519.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1514956.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 190,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.207208919363392,
                          "lon": 117.20407839188059
                        },
                        "count": 190
                      },
                      "sum_of_destination.bytes": {
                        "value": 707786.0
                      },
                      "sum_of_source.bytes": {
                        "value": 255682.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 116,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.06478445621304,
                          "lon": 19.92212065599923
                        },
                        "count": 116
                      },
                      "sum_of_destination.bytes": {
                        "value": 43090.0
                      },
                      "sum_of_source.bytes": {
                        "value": 36436.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 89,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.08625615348391,
                          "lon": -78.61698541999533
                        },
                        "count": 89
                      },
                      "sum_of_destination.bytes": {
                        "value": 174020.0
                      },
                      "sum_of_source.bytes": {
                        "value": 138976.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 37,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.874394572490978,
                          "lon": -74.82250003999955
                        },
                        "count": 37
                      },
                      "sum_of_destination.bytes": {
                        "value": 21862.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15334.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 952.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3362.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.30832497635856,
                          "lon": -123.19463753839955
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 600.0
                      },
                      "sum_of_source.bytes": {
                        "value": 894.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1156.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.505927253937855,
                          "lon": -3.4614000223915684
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 658.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 16.881466638296843,
                          "lon": 77.25924437865615
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 784.0
                      },
                      "sum_of_source.bytes": {
                        "value": 912.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.009699972346425,
                          "lon": 92.7916999720037
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 16062.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9222.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.29999997653067,
                          "lon": 69.59999992512167
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 340.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.98329997807741,
                          "lon": 23.733299989253283
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T08:30:00.000Z",
                "key": 1603009800000,
                "doc_count": 1981,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1317,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.41461547847905,
                          "lon": -121.76410240233623
                        },
                        "count": 1317
                      },
                      "sum_of_destination.bytes": {
                        "value": 9387885.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1339351.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 191,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.007814103620447,
                          "lon": 116.15625180162645
                        },
                        "count": 191
                      },
                      "sum_of_destination.bytes": {
                        "value": 273439.0
                      },
                      "sum_of_source.bytes": {
                        "value": 268363.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 168,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.09896545118785,
                          "lon": 19.196064241862455
                        },
                        "count": 168
                      },
                      "sum_of_destination.bytes": {
                        "value": 55164.0
                      },
                      "sum_of_source.bytes": {
                        "value": 41981.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 104,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.26803458435461,
                          "lon": 16.096769211312328
                        },
                        "count": 104
                      },
                      "sum_of_destination.bytes": {
                        "value": 965884.0
                      },
                      "sum_of_source.bytes": {
                        "value": 427366.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 60,
                      "sourceCentroid": {
                        "location": {
                          "lat": 18.468496638117358,
                          "lon": 75.67458661319688
                        },
                        "count": 60
                      },
                      "sum_of_destination.bytes": {
                        "value": 5776.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5444.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 57,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.606477203533838,
                          "lon": 55.63850519933591
                        },
                        "count": 57
                      },
                      "sum_of_destination.bytes": {
                        "value": 1232.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4068.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.65572350806392,
                          "lon": -74.0976118449779
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1030.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": -28.28444000892341,
                          "lon": -61.81934002228081
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 930.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.10452304966748,
                          "lon": -3.235338464952432
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1142.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.634399980306625,
                          "lon": -122.34220001846552
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 320.0
                      },
                      "sum_of_source.bytes": {
                        "value": 356.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T08:45:00.000Z",
                "key": 1603010700000,
                "doc_count": 831,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 242,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.877797904632185,
                          "lon": 114.5362879808084
                        },
                        "count": 242
                      },
                      "sum_of_destination.bytes": {
                        "value": 483773.0
                      },
                      "sum_of_source.bytes": {
                        "value": 319789.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 166,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.00634576133396,
                          "lon": -119.50312053543482
                        },
                        "count": 166
                      },
                      "sum_of_destination.bytes": {
                        "value": 2009121.0
                      },
                      "sum_of_source.bytes": {
                        "value": 58205.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 114,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.43257716651026,
                          "lon": 19.36930083326603
                        },
                        "count": 114
                      },
                      "sum_of_destination.bytes": {
                        "value": 4500.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11124.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 97,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.986703065857675,
                          "lon": -78.67165260813823
                        },
                        "count": 97
                      },
                      "sum_of_destination.bytes": {
                        "value": 214278.0
                      },
                      "sum_of_source.bytes": {
                        "value": 171168.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 96,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.04088746535126,
                          "lon": 15.07782498258166
                        },
                        "count": 96
                      },
                      "sum_of_destination.bytes": {
                        "value": 6936.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14904.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": 26.33745197597891,
                          "lon": 68.58487993329763
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 16357.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12013.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 868.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -32.38071431272796,
                          "lon": -65.11498574300536
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1416.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.513911083340645,
                          "lon": -2.3878666758537292
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 582.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.77114999201149,
                          "lon": -75.64715007785708
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 17828.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13188.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.18349996116012,
                          "lon": 50.118199959397316
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 13385.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7685.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T09:00:00.000Z",
                "key": 1603011600000,
                "doc_count": 861,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 305,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.127541935727855,
                          "lon": 115.88006521046894
                        },
                        "count": 305
                      },
                      "sum_of_destination.bytes": {
                        "value": 988591.0
                      },
                      "sum_of_source.bytes": {
                        "value": 424980.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 179,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.992257519588705,
                          "lon": -117.51602016274906
                        },
                        "count": 179
                      },
                      "sum_of_destination.bytes": {
                        "value": 3691654.0
                      },
                      "sum_of_source.bytes": {
                        "value": 76710.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 114,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.75294119722553,
                          "lon": 17.139116647457215
                        },
                        "count": 114
                      },
                      "sum_of_destination.bytes": {
                        "value": 7240.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15488.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 65,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.96485844018081,
                          "lon": 18.96877687008908
                        },
                        "count": 65
                      },
                      "sum_of_destination.bytes": {
                        "value": 2380.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7156.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 54,
                      "sourceCentroid": {
                        "location": {
                          "lat": 16.59920552590241,
                          "lon": 77.13461289492746
                        },
                        "count": 54
                      },
                      "sum_of_destination.bytes": {
                        "value": 6393.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6733.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 36,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 36
                      },
                      "sum_of_destination.bytes": {
                        "value": 1456.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3276.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 31,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.29983546164247,
                          "lon": -77.15711618082658
                        },
                        "count": 31
                      },
                      "sum_of_destination.bytes": {
                        "value": 2693.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4060.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.210858834195225,
                          "lon": 106.9227999624084
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 1400.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1816.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.620633313432336,
                          "lon": 61.244066655635834
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 1120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1576.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.230900017544627,
                          "lon": 28.058299999684095
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 640.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 828.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 712.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68999999668449,
                          "lon": 139.68999995850027
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 376.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -27.729800012893975,
                          "lon": -51.781000066548586
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 240.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.66829998791218,
                          "lon": -79.42050003446639
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T09:15:00.000Z",
                "key": 1603012500000,
                "doc_count": 911,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 349,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.926703979504058,
                          "lon": 117.0245546962863
                        },
                        "count": 349
                      },
                      "sum_of_destination.bytes": {
                        "value": 1036396.0
                      },
                      "sum_of_source.bytes": {
                        "value": 479979.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 218,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.28635823422479,
                          "lon": -114.42516655648349
                        },
                        "count": 218
                      },
                      "sum_of_destination.bytes": {
                        "value": 2024661.0
                      },
                      "sum_of_source.bytes": {
                        "value": 56673.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 96,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.90028225677088,
                          "lon": 15.243423941137735
                        },
                        "count": 96
                      },
                      "sum_of_destination.bytes": {
                        "value": 6288.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13830.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 92,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.53270650020315,
                          "lon": 21.61501626160158
                        },
                        "count": 92
                      },
                      "sum_of_destination.bytes": {
                        "value": 43836.0
                      },
                      "sum_of_source.bytes": {
                        "value": 31494.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.185800018720329,
                          "lon": 109.22708328114823
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 21754.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14582.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.847914261211244,
                          "lon": -3.883547629894955
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 896.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1996.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.83690523919895,
                          "lon": -80.40201584024257
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 13593.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9726.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1154.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": -28.78463847741771,
                          "lon": -57.23719234721592
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 844.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72139998432249,
                          "lon": -74.00520008057356
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 29159.0
                      },
                      "sum_of_source.bytes": {
                        "value": 16651.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 16.699999985285103,
                          "lon": 74.4666999578476
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.31669997237623,
                          "lon": 69.2499999795109
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 408.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T09:30:00.000Z",
                "key": 1603013400000,
                "doc_count": 896,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 299,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.006917022682575,
                          "lon": 117.51750331023166
                        },
                        "count": 299
                      },
                      "sum_of_destination.bytes": {
                        "value": 1023967.0
                      },
                      "sum_of_source.bytes": {
                        "value": 378244.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 246,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.06533940872404,
                          "lon": -115.62008703513662
                        },
                        "count": 246
                      },
                      "sum_of_destination.bytes": {
                        "value": 2587650.0
                      },
                      "sum_of_source.bytes": {
                        "value": 79332.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 100,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.31991796586662,
                          "lon": 16.28037798386067
                        },
                        "count": 100
                      },
                      "sum_of_destination.bytes": {
                        "value": 7128.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14768.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 76,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.82421839894041,
                          "lon": 15.987988105533939
                        },
                        "count": 76
                      },
                      "sum_of_destination.bytes": {
                        "value": 13508.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13276.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1858.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.90373330633156,
                          "lon": -77.55038340110332
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 1288.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1836.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.06320949284626,
                          "lon": 71.78979993664792
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1324.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -20.2082000230439,
                          "lon": -42.65315005090088
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 756.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.858600019477308,
                          "lon": 107.91639992035925
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 38079.0
                      },
                      "sum_of_source.bytes": {
                        "value": 23493.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.15075553674251,
                          "lon": -74.26103335805237
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 3205.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2340.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 540.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.8730999911204,
                          "lon": 74.60029995068908
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 340.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 1,
                      "sourceCentroid": {
                        "location": {
                          "lat": -31.766700013540685,
                          "lon": -52.333300011232495
                        },
                        "count": 1
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 62.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T09:45:00.000Z",
                "key": 1603014300000,
                "doc_count": 885,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 264,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.588443147558294,
                          "lon": 117.64997648456219
                        },
                        "count": 264
                      },
                      "sum_of_destination.bytes": {
                        "value": 660049.0
                      },
                      "sum_of_source.bytes": {
                        "value": 357639.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 172,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.03353951352128,
                          "lon": -119.58803494130586
                        },
                        "count": 172
                      },
                      "sum_of_destination.bytes": {
                        "value": 1482621.0
                      },
                      "sum_of_source.bytes": {
                        "value": 49645.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 149,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.21242481058826,
                          "lon": 21.061351631061743
                        },
                        "count": 149
                      },
                      "sum_of_destination.bytes": {
                        "value": 36575.0
                      },
                      "sum_of_source.bytes": {
                        "value": 30907.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 133,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.96719696425966,
                          "lon": 18.995763886986033
                        },
                        "count": 133
                      },
                      "sum_of_destination.bytes": {
                        "value": 8660.0
                      },
                      "sum_of_source.bytes": {
                        "value": 18082.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 56,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 56
                      },
                      "sum_of_destination.bytes": {
                        "value": 5260.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5818.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 52,
                      "sourceCentroid": {
                        "location": {
                          "lat": 22.309711515599002,
                          "lon": 74.43350379301522
                        },
                        "count": 52
                      },
                      "sum_of_destination.bytes": {
                        "value": 2728.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4472.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.473680020309985,
                          "lon": 107.14018663018942
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1680.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.40849997662008,
                          "lon": -74.05735006090254
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 464.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.009699972346425,
                          "lon": 92.7916999720037
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1200.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.31679998151958,
                          "lon": -73.8659000582993
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 960.0
                      },
                      "sum_of_source.bytes": {
                        "value": 420.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 464.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 2,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 2
                      },
                      "sum_of_destination.bytes": {
                        "value": 56.0
                      },
                      "sum_of_source.bytes": {
                        "value": 120.0
                      }
                    },
                    {
                      "key": "3/2/5",
                      "doc_count": 2,
                      "sourceCentroid": {
                        "location": {
                          "lat": -53.15000000875443,
                          "lon": -70.91670001856983
                        },
                        "count": 2
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 116.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T10:00:00.000Z",
                "key": 1603015200000,
                "doc_count": 1001,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 367,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.713951464371924,
                          "lon": 117.70591713404359
                        },
                        "count": 367
                      },
                      "sum_of_destination.bytes": {
                        "value": 1262951.0
                      },
                      "sum_of_source.bytes": {
                        "value": 571075.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 222,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.132396373419546,
                          "lon": -118.12737392035086
                        },
                        "count": 222
                      },
                      "sum_of_destination.bytes": {
                        "value": 3165923.0
                      },
                      "sum_of_source.bytes": {
                        "value": 79827.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 100,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.117919966578484,
                          "lon": 15.42337998189032
                        },
                        "count": 100
                      },
                      "sum_of_destination.bytes": {
                        "value": 6456.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14264.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 100,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.53487297827378,
                          "lon": 21.739499954972416
                        },
                        "count": 100
                      },
                      "sum_of_destination.bytes": {
                        "value": 15841.0
                      },
                      "sum_of_source.bytes": {
                        "value": 16280.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 67,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 67
                      },
                      "sum_of_destination.bytes": {
                        "value": 7260.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7508.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 36,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.208799972198904,
                          "lon": -77.5166500499472
                        },
                        "count": 36
                      },
                      "sum_of_destination.bytes": {
                        "value": 784.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2540.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 32,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.238018720789114,
                          "lon": 70.00788746285252
                        },
                        "count": 32
                      },
                      "sum_of_destination.bytes": {
                        "value": 880.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1956.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 29,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 29
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2198.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 46.16917996387929,
                          "lon": -3.898200038820505
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 592.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.88639997597784,
                          "lon": -78.87810003943741
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.40559997409582,
                          "lon": 61.927799955010414
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -24.646400003693998,
                          "lon": 25.91189995408058
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 576.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.40329998731613,
                          "lon": -9.138400023803115
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 300.0
                      }
                    },
                    {
                      "key": "3/2/5",
                      "doc_count": 2,
                      "sourceCentroid": {
                        "location": {
                          "lat": -53.15000000875443,
                          "lon": -70.91670001856983
                        },
                        "count": 2
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 116.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T10:15:00.000Z",
                "key": 1603016100000,
                "doc_count": 833,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 279,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.368274158888287,
                          "lon": 118.0430490718854
                        },
                        "count": 279
                      },
                      "sum_of_destination.bytes": {
                        "value": 885227.0
                      },
                      "sum_of_source.bytes": {
                        "value": 510743.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 171,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.77843565096784,
                          "lon": -120.24838601925264
                        },
                        "count": 171
                      },
                      "sum_of_destination.bytes": {
                        "value": 1741234.0
                      },
                      "sum_of_source.bytes": {
                        "value": 52582.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 128,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.35996715656802,
                          "lon": 17.92102497725864
                        },
                        "count": 128
                      },
                      "sum_of_destination.bytes": {
                        "value": 6792.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15676.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 77,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.94418179292183,
                          "lon": 18.278533728890025
                        },
                        "count": 77
                      },
                      "sum_of_destination.bytes": {
                        "value": 70357.0
                      },
                      "sum_of_source.bytes": {
                        "value": 46735.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 47,
                      "sourceCentroid": {
                        "location": {
                          "lat": 20.291270185658274,
                          "lon": 75.21756803933927
                        },
                        "count": 47
                      },
                      "sum_of_destination.bytes": {
                        "value": 1120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3758.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.635269975755364,
                          "lon": -76.63528004474938
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 2278.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2992.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.2095181577077,
                          "lon": 109.00311814705756
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 658.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.893972740931943,
                          "lon": -48.48124549639496
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 724.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 538.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.44779995921999,
                          "lon": 139.64249996468425
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 300.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.84099997766316,
                          "lon": -8.475600024685264
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -19.76910000666976,
                          "lon": -43.85400004684925
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.049999999813735,
                          "lon": -0.33330000936985016
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 240.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 1,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.249200018122792,
                          "lon": 112.75079995393753
                        },
                        "count": 1
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 62.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T10:30:00.000Z",
                "key": 1603017000000,
                "doc_count": 894,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 323,
                      "sourceCentroid": {
                        "location": {
                          "lat": 32.4576789153388,
                          "lon": 117.85400987054933
                        },
                        "count": 323
                      },
                      "sum_of_destination.bytes": {
                        "value": 1001011.0
                      },
                      "sum_of_source.bytes": {
                        "value": 511508.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 183,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.06831309234449,
                          "lon": -119.16153994220934
                        },
                        "count": 183
                      },
                      "sum_of_destination.bytes": {
                        "value": 2242167.0
                      },
                      "sum_of_source.bytes": {
                        "value": 70156.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 146,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.41164038857853,
                          "lon": 22.582269821201184
                        },
                        "count": 146
                      },
                      "sum_of_destination.bytes": {
                        "value": 15076.0
                      },
                      "sum_of_source.bytes": {
                        "value": 17878.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 96,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.54778746474767,
                          "lon": 15.55089998000767
                        },
                        "count": 96
                      },
                      "sum_of_destination.bytes": {
                        "value": 6120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13728.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 728.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2252.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.64224663376808,
                          "lon": 66.97663326188922
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 920.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.29977141666625,
                          "lon": -2.7291571921003714
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 844.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.561899970551686,
                          "lon": -74.22962865126985
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 856.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -21.77174001093954,
                          "lon": -42.08650002814829
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 774.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.249200018122792,
                          "lon": 112.75079995393753
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.573300018906593,
                          "lon": -46.64170000702143
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 340.0
                      }
                    },
                    {
                      "key": "3/4/1",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 69.93799996096641,
                          "lon": 22.05209992825985
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T10:45:00.000Z",
                "key": 1603017900000,
                "doc_count": 1295,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 590,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.27600964705728,
                          "lon": -120.91832004912135
                        },
                        "count": 590
                      },
                      "sum_of_destination.bytes": {
                        "value": 4479695.0
                      },
                      "sum_of_source.bytes": {
                        "value": 484495.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 271,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.194721737299183,
                          "lon": 118.12184166579037
                        },
                        "count": 271
                      },
                      "sum_of_destination.bytes": {
                        "value": 1373361.0
                      },
                      "sum_of_source.bytes": {
                        "value": 534301.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 157,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.944094882922094,
                          "lon": 25.572685306524015
                        },
                        "count": 157
                      },
                      "sum_of_destination.bytes": {
                        "value": 4368.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11632.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 108,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.00788700627163,
                          "lon": 16.657174981664866
                        },
                        "count": 108
                      },
                      "sum_of_destination.bytes": {
                        "value": 69076.0
                      },
                      "sum_of_source.bytes": {
                        "value": 53324.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 40,
                      "sourceCentroid": {
                        "location": {
                          "lat": 17.207489974913187,
                          "lon": 79.95832495414652
                        },
                        "count": 40
                      },
                      "sum_of_destination.bytes": {
                        "value": 17678.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11918.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 39,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 39
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3084.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.400099963881075,
                          "lon": -74.0325000230223
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 52035.0
                      },
                      "sum_of_source.bytes": {
                        "value": 32145.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -28.475000029429793,
                          "lon": -59.06315005850047
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 1344.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1632.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.76058180655607,
                          "lon": -75.8257091705772
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 16342.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9512.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -33.83900001179427,
                          "lon": 151.23959993943572
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.249200018122792,
                          "lon": 112.75079995393753
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 408.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T11:00:00.000Z",
                "key": 1603018800000,
                "doc_count": 2204,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1573,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.381270427117094,
                          "lon": -121.44740996497475
                        },
                        "count": 1573
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.0808659E7
                      },
                      "sum_of_source.bytes": {
                        "value": 1556108.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 340,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.608008203439084,
                          "lon": 117.42399261239916
                        },
                        "count": 340
                      },
                      "sum_of_destination.bytes": {
                        "value": 1395384.0
                      },
                      "sum_of_source.bytes": {
                        "value": 506239.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 100,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.117919966578484,
                          "lon": 15.42337998189032
                        },
                        "count": 100
                      },
                      "sum_of_destination.bytes": {
                        "value": 7198112.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3929540.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 80,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.65013247524621,
                          "lon": 23.104966204147786
                        },
                        "count": 80
                      },
                      "sum_of_destination.bytes": {
                        "value": 1960.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5832.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.41414283748184,
                          "lon": 57.03625233311738
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1714.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.26074997719843,
                          "lon": -3.0525000183843076
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1532.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.183299986778625,
                          "lon": -83.92361433777425
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 852.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 766.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 19.299999964423478,
                          "lon": 73.06669992394745
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 360.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 456.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -12.983300001360476,
                          "lon": -38.51670007221401
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1000.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.49999998975545,
                          "lon": -0.5833000782877207
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -21.528900023549795,
                          "lon": -49.885100070387125
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -33.8612000271678,
                          "lon": 151.19819995947182
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.04859996866435,
                          "lon": -123.21970003657043
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T11:15:00.000Z",
                "key": 1603019700000,
                "doc_count": 2138,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1539,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.379756583750506,
                          "lon": -121.66798653304359
                        },
                        "count": 1539
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.0795133E7
                      },
                      "sum_of_source.bytes": {
                        "value": 1549297.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 198,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.36186562533575,
                          "lon": 116.64959441150792
                        },
                        "count": 198
                      },
                      "sum_of_destination.bytes": {
                        "value": 706501.0
                      },
                      "sum_of_source.bytes": {
                        "value": 318443.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 120,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.060125809395686,
                          "lon": 20.475379954325035
                        },
                        "count": 120
                      },
                      "sum_of_destination.bytes": {
                        "value": 54392.0
                      },
                      "sum_of_source.bytes": {
                        "value": 34146.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 105,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.22421901473509,
                          "lon": 16.51353807720755
                        },
                        "count": 105
                      },
                      "sum_of_destination.bytes": {
                        "value": 19105.0
                      },
                      "sum_of_source.bytes": {
                        "value": 24590.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 39,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.209399960935116,
                          "lon": -73.21160006336868
                        },
                        "count": 39
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3472.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 33,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.623333346098661,
                          "lon": 55.617999946698546
                        },
                        "count": 33
                      },
                      "sum_of_destination.bytes": {
                        "value": 1232.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3234.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.605115768646723,
                          "lon": -74.47921058359115
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 784.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1492.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.905599965713918,
                          "lon": 67.08219992928207
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 1496.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1640.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -15.353700004687363,
                          "lon": -40.938827287913725
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 18863.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10999.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.166972707787696,
                          "lon": -9.539772737771273
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 682.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.234900006093085,
                          "lon": 106.98959997855127
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 408.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.500000024214387,
                          "lon": -47.45960008352995
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 816.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 57.152199978008866,
                          "lon": 65.52719998173416
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 3,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 3
                      },
                      "sum_of_destination.bytes": {
                        "value": 68.0
                      },
                      "sum_of_source.bytes": {
                        "value": 74.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 3,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 3
                      },
                      "sum_of_destination.bytes": {
                        "value": 168.0
                      },
                      "sum_of_source.bytes": {
                        "value": 174.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T11:30:00.000Z",
                "key": 1603020600000,
                "doc_count": 1818,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1118,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.39498505041866,
                          "lon": -120.94293421559196
                        },
                        "count": 1118
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.06386937E8
                      },
                      "sum_of_source.bytes": {
                        "value": 9415819.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 226,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.97327917098455,
                          "lon": 116.65722740298978
                        },
                        "count": 226
                      },
                      "sum_of_destination.bytes": {
                        "value": 766793.0
                      },
                      "sum_of_source.bytes": {
                        "value": 374243.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 107,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.299529874775665,
                          "lon": 16.110734557819978
                        },
                        "count": 107
                      },
                      "sum_of_destination.bytes": {
                        "value": 6052.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14288.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 103,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.860645609311035,
                          "lon": 16.67846887752197
                        },
                        "count": 103
                      },
                      "sum_of_destination.bytes": {
                        "value": 34809.0
                      },
                      "sum_of_source.bytes": {
                        "value": 30361.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 36,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.616661123000085,
                          "lon": 55.626116609200835
                        },
                        "count": 36
                      },
                      "sum_of_destination.bytes": {
                        "value": 896.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3072.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 35,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 35
                      },
                      "sum_of_destination.bytes": {
                        "value": 1556.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1730.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.81457998137921,
                          "lon": -75.45001338981092
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1500.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.385971435478756,
                          "lon": 107.50361423939466
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1756.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 696.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 19.99999998137355,
                          "lon": 76.99999993667006
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.87080001551658,
                          "lon": -43.77380006946623
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 320.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.88639997597784,
                          "lon": -78.87810003943741
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.04859996866435,
                          "lon": -123.21970003657043
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 3,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 3
                      },
                      "sum_of_destination.bytes": {
                        "value": 168.0
                      },
                      "sum_of_source.bytes": {
                        "value": 174.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 2,
                      "sourceCentroid": {
                        "location": {
                          "lat": -25.111200003884733,
                          "lon": -54.257900062948465
                        },
                        "count": 2
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 124.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T11:45:00.000Z",
                "key": 1603021500000,
                "doc_count": 1054,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 285,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.65161926515008,
                          "lon": 117.57073681301584
                        },
                        "count": 285
                      },
                      "sum_of_destination.bytes": {
                        "value": 795794.0
                      },
                      "sum_of_source.bytes": {
                        "value": 430280.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 234,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.2729632250893,
                          "lon": -113.57673081139532
                        },
                        "count": 234
                      },
                      "sum_of_destination.bytes": {
                        "value": 2.06547633E8
                      },
                      "sum_of_source.bytes": {
                        "value": 1.7954548E7
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 113,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.05118405363168,
                          "lon": 23.429169862621784
                        },
                        "count": 113
                      },
                      "sum_of_destination.bytes": {
                        "value": 5208.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11716.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 112,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.31600354116277,
                          "lon": 16.31194998011259
                        },
                        "count": 112
                      },
                      "sum_of_destination.bytes": {
                        "value": 6848.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15282.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 19.734081794423137,
                          "lon": -72.9464182418517
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 1568.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2152.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 54.91513331287673,
                          "lon": 56.88089996842401
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 1288.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2430.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 18.30701050005461,
                          "lon": 76.24402098455711
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 1064.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1540.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": -25.207031610862987,
                          "lon": -53.32318427384292
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1548.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.55909330770373,
                          "lon": -8.822033381089568
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 918.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 720.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 616.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1276.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -8.15310001373291,
                          "lon": -35.1280000526458
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 312.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 384.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T12:00:00.000Z",
                "key": 1603022400000,
                "doc_count": 1205,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 291,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.975555983381636,
                          "lon": 116.76801233706017
                        },
                        "count": 291
                      },
                      "sum_of_destination.bytes": {
                        "value": 896412.0
                      },
                      "sum_of_source.bytes": {
                        "value": 469406.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 264,
                      "sourceCentroid": {
                        "location": {
                          "lat": 19.547846566049635,
                          "lon": -78.71492578108287
                        },
                        "count": 264
                      },
                      "sum_of_destination.bytes": {
                        "value": 5790.0
                      },
                      "sum_of_source.bytes": {
                        "value": 17997.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 202,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.034511363175284,
                          "lon": -117.51870995179962
                        },
                        "count": 202
                      },
                      "sum_of_destination.bytes": {
                        "value": 1156037.0
                      },
                      "sum_of_source.bytes": {
                        "value": 50695.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 93,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.916018244179504,
                          "lon": 14.979624713680916
                        },
                        "count": 93
                      },
                      "sum_of_destination.bytes": {
                        "value": 6164.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13470.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 91,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.957202174670094,
                          "lon": 20.68531314330687
                        },
                        "count": 91
                      },
                      "sum_of_destination.bytes": {
                        "value": 15505.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13833.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 52,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.0446615582332,
                          "lon": -46.84363077681225
                        },
                        "count": 52
                      },
                      "sum_of_destination.bytes": {
                        "value": 2592.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2928.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 43,
                      "sourceCentroid": {
                        "location": {
                          "lat": 21.969674387946725,
                          "lon": 77.97404181883606
                        },
                        "count": 43
                      },
                      "sum_of_destination.bytes": {
                        "value": 3080.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3904.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 31,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.598796783736156,
                          "lon": 55.64784831848116
                        },
                        "count": 31
                      },
                      "sum_of_destination.bytes": {
                        "value": 616.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2180.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.175000034272671,
                          "lon": 106.82859996333718
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 48478.0
                      },
                      "sum_of_source.bytes": {
                        "value": 32046.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.19313997216523,
                          "lon": 46.11047996208072
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.05544997099787,
                          "lon": -79.28845002315938
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 712.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.634399980306625,
                          "lon": -122.34220001846552
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 38.71669999323785,
                          "lon": -9.133300054818392
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 544.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T12:15:00.000Z",
                "key": 1603023300000,
                "doc_count": 934,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 215,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.882553920907856,
                          "lon": 117.73585810845847
                        },
                        "count": 215
                      },
                      "sum_of_destination.bytes": {
                        "value": 459987.0
                      },
                      "sum_of_source.bytes": {
                        "value": 212965.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 208,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.24382641955834,
                          "lon": -117.42672216232258
                        },
                        "count": 208
                      },
                      "sum_of_destination.bytes": {
                        "value": 2243389.0
                      },
                      "sum_of_source.bytes": {
                        "value": 67890.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 155,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.43726771754483,
                          "lon": 17.45789221001248
                        },
                        "count": 155
                      },
                      "sum_of_destination.bytes": {
                        "value": 86439.0
                      },
                      "sum_of_source.bytes": {
                        "value": 44452.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 120,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.091063304571435,
                          "lon": 16.243156640790403
                        },
                        "count": 120
                      },
                      "sum_of_destination.bytes": {
                        "value": 9832.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15400.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 71,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.912011247482415,
                          "lon": -77.82106200941432
                        },
                        "count": 71
                      },
                      "sum_of_destination.bytes": {
                        "value": 12636.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10260.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 56,
                      "sourceCentroid": {
                        "location": {
                          "lat": -25.0657643051818,
                          "lon": -49.19516429438123
                        },
                        "count": 56
                      },
                      "sum_of_destination.bytes": {
                        "value": 2816.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3160.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 1712.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2222.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 44.727999991737306,
                          "lon": 117.19367993250489
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 644.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 57.12491109035909,
                          "lon": -9.78323339484632
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 538.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 22.716699982993305,
                          "lon": 75.83329995162785
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 17339.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9771.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.999999986961484,
                          "lon": 74.99999997206032
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.66669996641576,
                          "lon": -79.41670001484454
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 3,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174600021913648,
                          "lon": 106.82913327589631
                        },
                        "count": 3
                      },
                      "sum_of_destination.bytes": {
                        "value": 3489.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2435.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 2,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 2
                      },
                      "sum_of_destination.bytes": {
                        "value": 112.0
                      },
                      "sum_of_source.bytes": {
                        "value": 116.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T12:30:00.000Z",
                "key": 1603024200000,
                "doc_count": 782,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 260,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.745180734916804,
                          "lon": 118.33385497070132
                        },
                        "count": 260
                      },
                      "sum_of_destination.bytes": {
                        "value": 673107.0
                      },
                      "sum_of_source.bytes": {
                        "value": 370907.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 167,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.68346883993998,
                          "lon": -120.23127191153516
                        },
                        "count": 167
                      },
                      "sum_of_destination.bytes": {
                        "value": 1561317.0
                      },
                      "sum_of_source.bytes": {
                        "value": 49798.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 109,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.914606389401634,
                          "lon": 16.71548713511283
                        },
                        "count": 109
                      },
                      "sum_of_destination.bytes": {
                        "value": 6456.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14822.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 63,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.11793807122324,
                          "lon": 16.311417410948447
                        },
                        "count": 63
                      },
                      "sum_of_destination.bytes": {
                        "value": 36836.0
                      },
                      "sum_of_source.bytes": {
                        "value": 21615.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 45,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.61532667838037,
                          "lon": 55.62773994170129
                        },
                        "count": 45
                      },
                      "sum_of_destination.bytes": {
                        "value": 896.0
                      },
                      "sum_of_source.bytes": {
                        "value": 3634.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.502919976599514,
                          "lon": -79.37231337837875
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 58162.0
                      },
                      "sum_of_source.bytes": {
                        "value": 40675.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 29,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.515806872686692,
                          "lon": 66.97364477986663
                        },
                        "count": 29
                      },
                      "sum_of_destination.bytes": {
                        "value": 21482.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13664.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -30.62050590346403,
                          "lon": -59.146147089298154
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 32615.0
                      },
                      "sum_of_source.bytes": {
                        "value": 19959.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.622155531309545,
                          "lon": -74.14484452456236
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 550.0
                      }
                    },
                    {
                      "key": "3/2/5",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": -51.63330003619194,
                          "lon": -69.21670001931489
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1336.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T12:45:00.000Z",
                "key": 1603025100000,
                "doc_count": 859,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 235,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.187676148687274,
                          "lon": -115.06920472564215
                        },
                        "count": 235
                      },
                      "sum_of_destination.bytes": {
                        "value": 3338585.0
                      },
                      "sum_of_source.bytes": {
                        "value": 159670.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 232,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.488559449749904,
                          "lon": 118.10864393278186
                        },
                        "count": 232
                      },
                      "sum_of_destination.bytes": {
                        "value": 666733.0
                      },
                      "sum_of_source.bytes": {
                        "value": 326029.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 101,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.35260491557235,
                          "lon": 16.251181166914137
                        },
                        "count": 101
                      },
                      "sum_of_destination.bytes": {
                        "value": 6120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14026.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 97,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.40809379716778,
                          "lon": 20.586609227256368
                        },
                        "count": 97
                      },
                      "sum_of_destination.bytes": {
                        "value": 15737.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15675.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 43,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.29157206922943,
                          "lon": -78.38367677358694
                        },
                        "count": 43
                      },
                      "sum_of_destination.bytes": {
                        "value": 76417.0
                      },
                      "sum_of_source.bytes": {
                        "value": 53919.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 23,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.750456541898135,
                          "lon": -45.73203918038179
                        },
                        "count": 23
                      },
                      "sum_of_destination.bytes": {
                        "value": 5603.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5131.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1780.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1254.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": -11.76678462491299,
                          "lon": -37.63310002736174
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1046.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.731730747251557,
                          "lon": -69.95149237820162
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 820.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.6608999799937,
                          "lon": 73.12059996183962
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 744.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 46.8030181649903,
                          "lon": -3.9648727750913664
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 682.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.652159973978996,
                          "lon": 66.36815994791687
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 3012.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2908.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 240.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T13:00:00.000Z",
                "key": 1603026000000,
                "doc_count": 1058,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 268,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.39814287917202,
                          "lon": 117.94487421911683
                        },
                        "count": 268
                      },
                      "sum_of_destination.bytes": {
                        "value": 813076.0
                      },
                      "sum_of_source.bytes": {
                        "value": 347398.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 259,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.37797024790341,
                          "lon": -114.0959189609628
                        },
                        "count": 259
                      },
                      "sum_of_destination.bytes": {
                        "value": 5724325.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1.47907876E8
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 120,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.229383304249495,
                          "lon": 17.173933312296867
                        },
                        "count": 120
                      },
                      "sum_of_destination.bytes": {
                        "value": 6400.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15450.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 120,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.25742331251968,
                          "lon": 27.917003294220194
                        },
                        "count": 120
                      },
                      "sum_of_destination.bytes": {
                        "value": 34080.0
                      },
                      "sum_of_source.bytes": {
                        "value": 28649.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 97,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.374638134604034,
                          "lon": -76.80814025385939
                        },
                        "count": 97
                      },
                      "sum_of_destination.bytes": {
                        "value": 2920.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5870.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 50,
                      "sourceCentroid": {
                        "location": {
                          "lat": 22.48955797087401,
                          "lon": 71.35454792696983
                        },
                        "count": 50
                      },
                      "sum_of_destination.bytes": {
                        "value": 17745.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11471.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 34,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 34
                      },
                      "sum_of_destination.bytes": {
                        "value": 616.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2792.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 26,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.88639997597784,
                          "lon": -78.87810003943741
                        },
                        "count": 26
                      },
                      "sum_of_destination.bytes": {
                        "value": 67118.0
                      },
                      "sum_of_source.bytes": {
                        "value": 47940.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.25014498201199,
                          "lon": 69.73363997088745
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 952.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1714.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.281858841614688,
                          "lon": 111.38615877148422
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1508.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -19.504318207671698,
                          "lon": -43.56949093582278
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 692.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -21.695500030182302,
                          "lon": -45.888100024312735
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 240.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T13:15:00.000Z",
                "key": 1603026900000,
                "doc_count": 965,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 383,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.455885867610107,
                          "lon": 117.92144905243254
                        },
                        "count": 383
                      },
                      "sum_of_destination.bytes": {
                        "value": 1085822.0
                      },
                      "sum_of_source.bytes": {
                        "value": 489422.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 222,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.15949457180309,
                          "lon": -115.2417667124521
                        },
                        "count": 222
                      },
                      "sum_of_destination.bytes": {
                        "value": 3031090.0
                      },
                      "sum_of_source.bytes": {
                        "value": 157876.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 120,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.34915163554251,
                          "lon": 16.652269976679236
                        },
                        "count": 120
                      },
                      "sum_of_destination.bytes": {
                        "value": 6120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15180.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 69,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.96067388886181,
                          "lon": 22.842736178604156
                        },
                        "count": 69
                      },
                      "sum_of_destination.bytes": {
                        "value": 3024.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9860.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 54,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.1553518405805,
                          "lon": -75.79171487440665
                        },
                        "count": 54
                      },
                      "sum_of_destination.bytes": {
                        "value": 12652.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8912.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 38,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.38201050450535,
                          "lon": -78.0978158224178
                        },
                        "count": 38
                      },
                      "sum_of_destination.bytes": {
                        "value": 98266.0
                      },
                      "sum_of_source.bytes": {
                        "value": 66274.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.27462498121895,
                          "lon": -1.674187540775165
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 952.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 806.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.92706664837897,
                          "lon": 77.65323330648243
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1320.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -28.719018212180924,
                          "lon": -60.35402730276639
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 13461.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8071.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.8695999905467,
                          "lon": -119.68800005502999
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.616799973882735,
                          "lon": 137.10699998773634
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 512.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T13:30:00.000Z",
                "key": 1603027800000,
                "doc_count": 823,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 231,
                      "sourceCentroid": {
                        "location": {
                          "lat": 33.052627249052385,
                          "lon": -115.33483641089073
                        },
                        "count": 231
                      },
                      "sum_of_destination.bytes": {
                        "value": 1609448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 127338.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 220,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.335603148972783,
                          "lon": 117.82154087883167
                        },
                        "count": 220
                      },
                      "sum_of_destination.bytes": {
                        "value": 614181.0
                      },
                      "sum_of_source.bytes": {
                        "value": 273432.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 117,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.7079717759043,
                          "lon": 22.07191020823442
                        },
                        "count": 117
                      },
                      "sum_of_destination.bytes": {
                        "value": 7570.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13150.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 99,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.11999491610649,
                          "lon": 15.432687860659577
                        },
                        "count": 99
                      },
                      "sum_of_destination.bytes": {
                        "value": 6052.0
                      },
                      "sum_of_source.bytes": {
                        "value": 13792.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 35,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.74228568787554,
                          "lon": -80.12797147035599
                        },
                        "count": 35
                      },
                      "sum_of_destination.bytes": {
                        "value": 68334.0
                      },
                      "sum_of_source.bytes": {
                        "value": 49696.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": 21.896375970728695,
                          "lon": 70.40317592471838
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 2040.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2432.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1358.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 48.0821999773616,
                          "lon": -4.8262625362258404
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 968.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 38.640333311632276,
                          "lon": -76.25540839042515
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 56.0
                      },
                      "sum_of_source.bytes": {
                        "value": 755.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 890.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.175000034272671,
                          "lon": 106.82859996333718
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 17711.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10031.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.60330003872514,
                          "lon": -58.38170003145933
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -20.332200033590198,
                          "lon": -40.345000019297004
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.865399995818734,
                          "lon": 139.66009994968772
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 800.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T13:45:00.000Z",
                "key": 1603028700000,
                "doc_count": 1584,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 884,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.32971503208202,
                          "lon": -119.96346022803084
                        },
                        "count": 884
                      },
                      "sum_of_destination.bytes": {
                        "value": 6630367.0
                      },
                      "sum_of_source.bytes": {
                        "value": 887425.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 239,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.657933022242396,
                          "lon": 117.50049996832736
                        },
                        "count": 239
                      },
                      "sum_of_destination.bytes": {
                        "value": 521767.0
                      },
                      "sum_of_source.bytes": {
                        "value": 400666.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 118,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.74569827529712,
                          "lon": 17.87490167323563
                        },
                        "count": 118
                      },
                      "sum_of_destination.bytes": {
                        "value": 6456.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15380.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 68,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.603213212808924,
                          "lon": 18.766402888166553
                        },
                        "count": 68
                      },
                      "sum_of_destination.bytes": {
                        "value": 3080.0
                      },
                      "sum_of_source.bytes": {
                        "value": 5960.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 41,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.7151024131695,
                          "lon": -77.19926100315118
                        },
                        "count": 41
                      },
                      "sum_of_destination.bytes": {
                        "value": 73832.0
                      },
                      "sum_of_source.bytes": {
                        "value": 52578.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 33,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.100296948867086,
                          "lon": 76.07299085621807
                        },
                        "count": 33
                      },
                      "sum_of_destination.bytes": {
                        "value": 1744.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2932.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 32,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.67981872675591,
                          "lon": -75.617131315812
                        },
                        "count": 32
                      },
                      "sum_of_destination.bytes": {
                        "value": 30627.0
                      },
                      "sum_of_source.bytes": {
                        "value": 18149.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": -25.531241683638655,
                          "lon": -62.11411252501421
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 17105.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12593.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.611558834748233,
                          "lon": 55.632323468761406
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1486.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.910063611174174,
                          "lon": 52.01982722617686
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 670.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 682.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.582599989138544,
                          "lon": 139.74589996039867
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.54569996986538,
                          "lon": -0.1403000671416521
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.9222000148147345,
                          "lon": 107.60689998976886
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.230900017544627,
                          "lon": 28.058299999684095
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 11949.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8614.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T14:00:00.000Z",
                "key": 1603029600000,
                "doc_count": 2288,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1591,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.9415255068432,
                          "lon": -121.05573731970972
                        },
                        "count": 1591
                      },
                      "sum_of_destination.bytes": {
                        "value": 9678644.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1620678.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 328,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.160883806239838,
                          "lon": 118.04113319986953
                        },
                        "count": 328
                      },
                      "sum_of_destination.bytes": {
                        "value": 692795.0
                      },
                      "sum_of_source.bytes": {
                        "value": 336917.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 133,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.677932308363566,
                          "lon": 23.646905967559583
                        },
                        "count": 133
                      },
                      "sum_of_destination.bytes": {
                        "value": 125583.0
                      },
                      "sum_of_source.bytes": {
                        "value": 64169.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 114,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.50811575750183,
                          "lon": 18.697115774511506
                        },
                        "count": 114
                      },
                      "sum_of_destination.bytes": {
                        "value": 7464.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15216.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 38,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.64338944923427,
                          "lon": -77.34448950223036
                        },
                        "count": 38
                      },
                      "sum_of_destination.bytes": {
                        "value": 70891.0
                      },
                      "sum_of_source.bytes": {
                        "value": 50786.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 2125.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7390.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.915707123864973,
                          "lon": -72.40275721997023
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 882.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.303045473400164,
                          "lon": -52.78031822293997
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 718.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.696099968627095,
                          "lon": 51.42309992574155
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68999999668449,
                          "lon": 139.68999995850027
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 20934.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12978.0
                      }
                    },
                    {
                      "key": "3/4/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -26.230900017544627,
                          "lon": 28.058299999684095
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 408.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 696.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -20.85290003567934,
                          "lon": -41.119200037792325
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.43579997122288,
                          "lon": 59.11999993957579
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 800.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T14:15:00.000Z",
                "key": 1603030500000,
                "doc_count": 2287,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1612,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.9213779656495,
                          "lon": -120.95842963780181
                        },
                        "count": 1612
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.0639666E7
                      },
                      "sum_of_source.bytes": {
                        "value": 1620425.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 320,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.485019967716653,
                          "lon": 116.17771496044588
                        },
                        "count": 320
                      },
                      "sum_of_destination.bytes": {
                        "value": 869732.0
                      },
                      "sum_of_source.bytes": {
                        "value": 339524.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 124,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.86749110017873,
                          "lon": 17.432200786011713
                        },
                        "count": 124
                      },
                      "sum_of_destination.bytes": {
                        "value": 13098.0
                      },
                      "sum_of_source.bytes": {
                        "value": 20342.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 79,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.87853415352823,
                          "lon": 25.371044267416945
                        },
                        "count": 79
                      },
                      "sum_of_destination.bytes": {
                        "value": 2688.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8238.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 43,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.37339532594088,
                          "lon": -77.89142096263551
                        },
                        "count": 43
                      },
                      "sum_of_destination.bytes": {
                        "value": 80523.0
                      },
                      "sum_of_source.bytes": {
                        "value": 57466.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 25,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 25
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1974.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68999999668449,
                          "lon": 139.68999995850027
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 41568.0
                      },
                      "sum_of_source.bytes": {
                        "value": 25656.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.33126359737732,
                          "lon": -2.9071727352724834
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 13433.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7777.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": -29.071750023867935,
                          "lon": -52.3454000428319
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 480.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.61069997260347,
                          "lon": -70.46095004305243
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 896.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1032.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 11.25,
                          "lon": 75.76669994741678
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 816.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.993100019171834,
                          "lon": 110.42079993523657
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.999999986961484,
                          "lon": 74.99999997206032
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T14:30:00.000Z",
                "key": 1603031400000,
                "doc_count": 1587,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 979,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.2191574953095,
                          "lon": -120.98456725901501
                        },
                        "count": 979
                      },
                      "sum_of_destination.bytes": {
                        "value": 6410289.0
                      },
                      "sum_of_source.bytes": {
                        "value": 909763.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 195,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.954318427265836,
                          "lon": 118.45504663426142
                        },
                        "count": 195
                      },
                      "sum_of_destination.bytes": {
                        "value": 921586.0
                      },
                      "sum_of_source.bytes": {
                        "value": 270674.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 124,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.468973363351616,
                          "lon": 27.982127381443618
                        },
                        "count": 124
                      },
                      "sum_of_destination.bytes": {
                        "value": 16681.0
                      },
                      "sum_of_source.bytes": {
                        "value": 25002.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 123,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.650560945590456,
                          "lon": 15.483765831989485
                        },
                        "count": 123
                      },
                      "sum_of_destination.bytes": {
                        "value": 59287.0
                      },
                      "sum_of_source.bytes": {
                        "value": 52579.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 41,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.26821217533746,
                          "lon": -72.64439273421175
                        },
                        "count": 41
                      },
                      "sum_of_destination.bytes": {
                        "value": 2688.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4445.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 29,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.24744825267458,
                          "lon": -78.14659658594636
                        },
                        "count": 29
                      },
                      "sum_of_destination.bytes": {
                        "value": 65269.0
                      },
                      "sum_of_source.bytes": {
                        "value": 44954.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 952.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1972.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.584731222712435,
                          "lon": -1.3488438067724928
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 982.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.617614297728453,
                          "lon": 55.624957085986225
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 916.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": -29.21570001170039,
                          "lon": -51.4062500372529
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.672888852655888,
                          "lon": 56.47683328948915
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 774.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.87510001566261,
                          "lon": -43.27750003896654
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 708.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.8730999911204,
                          "lon": 74.60029995068908
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 48.41669997666031,
                          "lon": -123.36500007659197
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 10708.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6148.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T14:45:00.000Z",
                "key": 1603032300000,
                "doc_count": 881,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 235,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.05606295693507,
                          "lon": -117.41032685501936
                        },
                        "count": 235
                      },
                      "sum_of_destination.bytes": {
                        "value": 3123835.0
                      },
                      "sum_of_source.bytes": {
                        "value": 83000.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 213,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.291900435921697,
                          "lon": 117.92695020115606
                        },
                        "count": 213
                      },
                      "sum_of_destination.bytes": {
                        "value": 643377.0
                      },
                      "sum_of_source.bytes": {
                        "value": 294358.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 132,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.47261437195861,
                          "lon": 22.790029503574427
                        },
                        "count": 132
                      },
                      "sum_of_destination.bytes": {
                        "value": 29778.0
                      },
                      "sum_of_source.bytes": {
                        "value": 31202.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 104,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.20941727502773,
                          "lon": 15.8315961358424
                        },
                        "count": 104
                      },
                      "sum_of_destination.bytes": {
                        "value": 6756.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14974.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 41,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.96109265659186,
                          "lon": -77.8884658882985
                        },
                        "count": 41
                      },
                      "sum_of_destination.bytes": {
                        "value": 91367.0
                      },
                      "sum_of_source.bytes": {
                        "value": 62632.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 34,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 34
                      },
                      "sum_of_destination.bytes": {
                        "value": 1504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1672.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": 23.16654163529165,
                          "lon": 70.68884993204847
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2288.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 616.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1756.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": -20.315343772235792,
                          "lon": -50.451406285283156
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 30279.0
                      },
                      "sum_of_source.bytes": {
                        "value": 18536.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.29309997474775,
                          "lon": 71.82304996065795
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1188.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72139998432249,
                          "lon": -74.00520008057356
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 472.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 696.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.21609999332577,
                          "lon": -111.97130005806684
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -33.494000039063394,
                          "lon": 143.21039996109903
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T15:00:00.000Z",
                "key": 1603033200000,
                "doc_count": 812,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 204,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.455544573282275,
                          "lon": 117.12397447910489
                        },
                        "count": 204
                      },
                      "sum_of_destination.bytes": {
                        "value": 731443.0
                      },
                      "sum_of_source.bytes": {
                        "value": 368010.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 195,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.92419536297138,
                          "lon": -118.91528518039446
                        },
                        "count": 195
                      },
                      "sum_of_destination.bytes": {
                        "value": 1969003.0
                      },
                      "sum_of_source.bytes": {
                        "value": 60624.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 134,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.847974608283934,
                          "lon": 20.56467158949253
                        },
                        "count": 134
                      },
                      "sum_of_destination.bytes": {
                        "value": 15828.0
                      },
                      "sum_of_source.bytes": {
                        "value": 21809.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 114,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.14886224894833,
                          "lon": 16.978052609207992
                        },
                        "count": 114
                      },
                      "sum_of_destination.bytes": {
                        "value": 6568.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15114.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 51,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.035586314823696,
                          "lon": -56.888613764415766
                        },
                        "count": 51
                      },
                      "sum_of_destination.bytes": {
                        "value": 122498.0
                      },
                      "sum_of_source.bytes": {
                        "value": 85634.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 23,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.731008685720354,
                          "lon": 139.658478229995
                        },
                        "count": 23
                      },
                      "sum_of_destination.bytes": {
                        "value": 23428.0
                      },
                      "sum_of_source.bytes": {
                        "value": 22710.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.606176200988037,
                          "lon": 55.638871364561574
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1374.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 18.630349970189855,
                          "lon": -76.15215007541701
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 728.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1882.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.602499969303608,
                          "lon": 59.394859962165356
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 944.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 836.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T15:15:00.000Z",
                "key": 1603034100000,
                "doc_count": 910,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 292,
                      "sourceCentroid": {
                        "location": {
                          "lat": 32.53220750127396,
                          "lon": 118.07622633810627
                        },
                        "count": 292
                      },
                      "sum_of_destination.bytes": {
                        "value": 809786.0
                      },
                      "sum_of_source.bytes": {
                        "value": 355247.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 181,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.24157732697873,
                          "lon": -120.11238568889502
                        },
                        "count": 181
                      },
                      "sum_of_destination.bytes": {
                        "value": 2571175.0
                      },
                      "sum_of_source.bytes": {
                        "value": 70975.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 139,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.898817967777575,
                          "lon": 23.319845279249893
                        },
                        "count": 139
                      },
                      "sum_of_destination.bytes": {
                        "value": 6492.0
                      },
                      "sum_of_source.bytes": {
                        "value": 23350.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 101,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.064789074860364,
                          "lon": 14.283517803812382
                        },
                        "count": 101
                      },
                      "sum_of_destination.bytes": {
                        "value": 6120.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14002.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 46,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.93140004109591,
                          "lon": -57.94890004210174
                        },
                        "count": 46
                      },
                      "sum_of_destination.bytes": {
                        "value": 122222.0
                      },
                      "sum_of_source.bytes": {
                        "value": 83560.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 28,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 28
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1982.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 28,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.89922140741588,
                          "lon": -72.55979290631201
                        },
                        "count": 28
                      },
                      "sum_of_destination.bytes": {
                        "value": 840.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2256.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 504.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1292.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.645454531789504,
                          "lon": 76.58636359159242
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 718.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.52705997414887,
                          "lon": -82.99650001712143
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 604.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.2449000286869705,
                          "lon": 106.82203330099583
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 748.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T15:30:00.000Z",
                "key": 1603035000000,
                "doc_count": 899,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 359,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.703289660931276,
                          "lon": 117.02690498184796
                        },
                        "count": 359
                      },
                      "sum_of_destination.bytes": {
                        "value": 903789.0
                      },
                      "sum_of_source.bytes": {
                        "value": 376282.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 206,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.02332618993987,
                          "lon": -116.75380344620173
                        },
                        "count": 206
                      },
                      "sum_of_destination.bytes": {
                        "value": 1555501.0
                      },
                      "sum_of_source.bytes": {
                        "value": 62891.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 125,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.719831172302364,
                          "lon": 17.04836477614939
                        },
                        "count": 125
                      },
                      "sum_of_destination.bytes": {
                        "value": 7240.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15840.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 55,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.805749068036675,
                          "lon": 23.4854035936296
                        },
                        "count": 55
                      },
                      "sum_of_destination.bytes": {
                        "value": 1568.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4610.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 53,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.71194720704038,
                          "lon": -58.23825852980591
                        },
                        "count": 53
                      },
                      "sum_of_destination.bytes": {
                        "value": 114115.0
                      },
                      "sum_of_source.bytes": {
                        "value": 81224.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.620831262436695,
                          "lon": 55.621043695136905
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 992.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.345814264911628,
                          "lon": -71.64925718546978
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 11044.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6780.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.8695999905467,
                          "lon": -119.68800005502999
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 432.0
                      },
                      "sum_of_source.bytes": {
                        "value": 480.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.78469996433705,
                          "lon": 55.098599921911955
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 928.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -33.93330002669245,
                          "lon": 151.1999999731779
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.599999980069697,
                          "lon": 77.19999994151294
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 13545.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9470.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 276.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.54569996986538,
                          "lon": -0.1403000671416521
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 3,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.594400000758469,
                          "lon": 106.78919998928905
                        },
                        "count": 3
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 204.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T15:45:00.000Z",
                "key": 1603035900000,
                "doc_count": 868,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 307,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.874182377380684,
                          "lon": 118.25713644811356
                        },
                        "count": 307
                      },
                      "sum_of_destination.bytes": {
                        "value": 957420.0
                      },
                      "sum_of_source.bytes": {
                        "value": 401862.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 200,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.899484477122314,
                          "lon": -117.82645104811527
                        },
                        "count": 200
                      },
                      "sum_of_destination.bytes": {
                        "value": 2288594.0
                      },
                      "sum_of_source.bytes": {
                        "value": 72446.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 117,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.002923047098406,
                          "lon": 16.642375192246757
                        },
                        "count": 117
                      },
                      "sum_of_destination.bytes": {
                        "value": 6812.0
                      },
                      "sum_of_source.bytes": {
                        "value": 15786.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 85,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.19374351115788,
                          "lon": 24.248557595974383
                        },
                        "count": 85
                      },
                      "sum_of_destination.bytes": {
                        "value": 2376.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7162.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 52,
                      "sourceCentroid": {
                        "location": {
                          "lat": -31.851211576633013,
                          "lon": -60.52020195961142
                        },
                        "count": 52
                      },
                      "sum_of_destination.bytes": {
                        "value": 139320.0
                      },
                      "sum_of_source.bytes": {
                        "value": 97244.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.86021902744791,
                          "lon": -72.92209531047514
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 728.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1282.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.623333346098661,
                          "lon": 55.617999946698546
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 744.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.790209094739772,
                          "lon": -43.172772784124724
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 2141.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2056.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.8695999905467,
                          "lon": -119.68800005502999
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 432.0
                      },
                      "sum_of_source.bytes": {
                        "value": 480.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/7/5",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -43.53330000769347,
                          "lon": 172.63329994864762
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.496399962343276,
                          "lon": -0.12240001000463963
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 13385.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7685.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68999999668449,
                          "lon": 139.68999995850027
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.174400015734136,
                          "lon": 106.82939993217587
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 10980.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6148.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 25.25819997768849,
                          "lon": 55.30469994060695
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 10708.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6212.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T16:00:00.000Z",
                "key": 1603036800000,
                "doc_count": 904,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 312,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.6005403518032,
                          "lon": 118.64754739880132
                        },
                        "count": 312
                      },
                      "sum_of_destination.bytes": {
                        "value": 605005.0
                      },
                      "sum_of_source.bytes": {
                        "value": 420960.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 195,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.19841844022561,
                          "lon": -119.16119133222561
                        },
                        "count": 195
                      },
                      "sum_of_destination.bytes": {
                        "value": 1282793.0
                      },
                      "sum_of_source.bytes": {
                        "value": 50894.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 101,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.134731661592895,
                          "lon": 19.337503913384264
                        },
                        "count": 101
                      },
                      "sum_of_destination.bytes": {
                        "value": 18621.0
                      },
                      "sum_of_source.bytes": {
                        "value": 16563.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 100,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.91925196517259,
                          "lon": 16.23471198230982
                        },
                        "count": 100
                      },
                      "sum_of_destination.bytes": {
                        "value": 6680.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14256.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 64,
                      "sourceCentroid": {
                        "location": {
                          "lat": -30.327815658965847,
                          "lon": -58.333064099861076
                        },
                        "count": 64
                      },
                      "sum_of_destination.bytes": {
                        "value": 133557.0
                      },
                      "sum_of_source.bytes": {
                        "value": 89836.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.6105954656377435,
                          "lon": 55.63349539329383
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1614.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 39.992074978072196,
                          "lon": -5.046325013972819
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1510.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": -33.8612000271678,
                          "lon": 151.19819995947182
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 640.0
                      },
                      "sum_of_source.bytes": {
                        "value": 712.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 15.301257111132145,
                          "lon": 68.14468564066503
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 852.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.507727247239515,
                          "lon": -0.10375458831814202
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2566.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.78317775391042,
                          "lon": -74.07492228783667
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 13609.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7917.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.025400018319488,
                          "lon": -37.276700008660555
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 1008.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1200.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.44999998062849,
                          "lon": 65.3332999907434
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 1,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 1
                      },
                      "sum_of_destination.bytes": {
                        "value": 2677.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1553.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T16:15:00.000Z",
                "key": 1603037700000,
                "doc_count": 1000,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 234,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.68750467026033,
                          "lon": 118.76077517938728
                        },
                        "count": 234
                      },
                      "sum_of_destination.bytes": {
                        "value": 995748.0
                      },
                      "sum_of_source.bytes": {
                        "value": 448283.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 198,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.00594644210386,
                          "lon": -118.40759298298508
                        },
                        "count": 198
                      },
                      "sum_of_destination.bytes": {
                        "value": 2855191.0
                      },
                      "sum_of_source.bytes": {
                        "value": 71148.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 142,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.9765718107138,
                          "lon": 21.665279528086767
                        },
                        "count": 142
                      },
                      "sum_of_destination.bytes": {
                        "value": 77544.0
                      },
                      "sum_of_source.bytes": {
                        "value": 57712.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 112,
                      "sourceCentroid": {
                        "location": {
                          "lat": 34.05238746815095,
                          "lon": 17.34520890966191
                        },
                        "count": 112
                      },
                      "sum_of_destination.bytes": {
                        "value": 6344.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14676.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 85,
                      "sourceCentroid": {
                        "location": {
                          "lat": -25.10299532422248,
                          "lon": -65.68102825915112
                        },
                        "count": 85
                      },
                      "sum_of_destination.bytes": {
                        "value": 212115.0
                      },
                      "sum_of_source.bytes": {
                        "value": 146402.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 63,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.901300000958145,
                          "lon": -43.28150005079806
                        },
                        "count": 63
                      },
                      "sum_of_destination.bytes": {
                        "value": 222484.0
                      },
                      "sum_of_source.bytes": {
                        "value": 86996.0
                      }
                    },
                    {
                      "key": "3/7/4",
                      "doc_count": 33,
                      "sourceCentroid": {
                        "location": {
                          "lat": -34.47060911662199,
                          "lon": 150.2919120764868
                        },
                        "count": 33
                      },
                      "sum_of_destination.bytes": {
                        "value": 1560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1714.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.616054557263851,
                          "lon": 55.62685448761013
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 784.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2104.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.70890998421237,
                          "lon": -119.23093003034592
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 640.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1084.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1054.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 24.905599965713918,
                          "lon": 67.08219992928207
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 728.0
                      },
                      "sum_of_source.bytes": {
                        "value": 884.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.50598458802471,
                          "lon": -0.10662311473144935
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 782.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.4429090636867,
                          "lon": -77.23730003545907
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1115.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.52999996779753,
                          "lon": -74.2745143654091
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 56.0
                      },
                      "sum_of_source.bytes": {
                        "value": 430.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 54.90116665139794,
                          "lon": 65.87754995562136
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 352.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T16:30:00.000Z",
                "key": 1603038600000,
                "doc_count": 972,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 253,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.24970985801058,
                          "lon": -114.48666565271147
                        },
                        "count": 253
                      },
                      "sum_of_destination.bytes": {
                        "value": 2086890.0
                      },
                      "sum_of_source.bytes": {
                        "value": 69609.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 226,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.195742890539588,
                          "lon": 118.17596677678382
                        },
                        "count": 226
                      },
                      "sum_of_destination.bytes": {
                        "value": 857294.0
                      },
                      "sum_of_source.bytes": {
                        "value": 413278.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 170,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.901300000958145,
                          "lon": -43.28150005079806
                        },
                        "count": 170
                      },
                      "sum_of_destination.bytes": {
                        "value": 547776.0
                      },
                      "sum_of_source.bytes": {
                        "value": 229168.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 115,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.073266926464505,
                          "lon": 17.001927806955315
                        },
                        "count": 115
                      },
                      "sum_of_destination.bytes": {
                        "value": 19980.0
                      },
                      "sum_of_source.bytes": {
                        "value": 24090.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 62,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.93298707738699,
                          "lon": 23.297166092501534
                        },
                        "count": 62
                      },
                      "sum_of_destination.bytes": {
                        "value": 25833.0
                      },
                      "sum_of_source.bytes": {
                        "value": 17519.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 50,
                      "sourceCentroid": {
                        "location": {
                          "lat": -31.28292403416708,
                          "lon": -59.14828003831208
                        },
                        "count": 50
                      },
                      "sum_of_destination.bytes": {
                        "value": 99341.0
                      },
                      "sum_of_source.bytes": {
                        "value": 70626.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 27.58675711761628,
                          "lon": -71.99845722211259
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 17350.0
                      },
                      "sum_of_source.bytes": {
                        "value": 10710.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2088.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 9,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.886455529369414,
                          "lon": -78.87826669961214
                        },
                        "count": 9
                      },
                      "sum_of_destination.bytes": {
                        "value": 300.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1264.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 8,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.44999998062849,
                          "lon": 65.3332999907434
                        },
                        "count": 8
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 496.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 12.98329995945096,
                          "lon": 77.58329993113875
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 310.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 464.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T16:45:00.000Z",
                "key": 1603039500000,
                "doc_count": 1633,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 943,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.29919256458764,
                          "lon": -121.13846515957168
                        },
                        "count": 943
                      },
                      "sum_of_destination.bytes": {
                        "value": 7649864.0
                      },
                      "sum_of_source.bytes": {
                        "value": 908838.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 214,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.7837125856351,
                          "lon": 117.90523594493378
                        },
                        "count": 214
                      },
                      "sum_of_destination.bytes": {
                        "value": 550269.0
                      },
                      "sum_of_source.bytes": {
                        "value": 302874.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 162,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.82295185296486,
                          "lon": -43.298043259936904
                        },
                        "count": 162
                      },
                      "sum_of_destination.bytes": {
                        "value": 542511.0
                      },
                      "sum_of_source.bytes": {
                        "value": 216842.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 122,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.559957347268266,
                          "lon": 17.182652439586207
                        },
                        "count": 122
                      },
                      "sum_of_destination.bytes": {
                        "value": 7016.0
                      },
                      "sum_of_source.bytes": {
                        "value": 16110.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 77,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.637776600850096,
                          "lon": 24.535431127100214
                        },
                        "count": 77
                      },
                      "sum_of_destination.bytes": {
                        "value": 44208.0
                      },
                      "sum_of_source.bytes": {
                        "value": 31223.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 21,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.67231902386993,
                          "lon": -74.12778101595384
                        },
                        "count": 21
                      },
                      "sum_of_destination.bytes": {
                        "value": 672.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1633.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1386.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 16,
                      "sourceCentroid": {
                        "location": {
                          "lat": -12.05000001937151,
                          "lon": -77.05000000074506
                        },
                        "count": 16
                      },
                      "sum_of_destination.bytes": {
                        "value": 40039.0
                      },
                      "sum_of_source.bytes": {
                        "value": 26618.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 30.065366635099053,
                          "lon": 59.66879996471107
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 13601.0
                      },
                      "sum_of_source.bytes": {
                        "value": 8235.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 14,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.642742831393015,
                          "lon": -2.167457194466676
                        },
                        "count": 14
                      },
                      "sum_of_destination.bytes": {
                        "value": 784.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1308.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 33.59279996249825,
                          "lon": -7.619200022891164
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 16611.0
                      },
                      "sum_of_source.bytes": {
                        "value": 11918.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.99999998882413,
                          "lon": 67.99999997019768
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.5039999820292,
                          "lon": -73.5747000016272
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 10708.0
                      },
                      "sum_of_source.bytes": {
                        "value": 6148.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 1,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.66329998895526,
                          "lon": 139.8592999856919
                        },
                        "count": 1
                      },
                      "sum_of_destination.bytes": {
                        "value": 1649.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1014.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T17:00:00.000Z",
                "key": 1603040400000,
                "doc_count": 2370,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1532,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.31975997549812,
                          "lon": -121.74387106671321
                        },
                        "count": 1532
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.0021055E7
                      },
                      "sum_of_source.bytes": {
                        "value": 1554311.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 283,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.773132477070835,
                          "lon": 118.04941020619664
                        },
                        "count": 283
                      },
                      "sum_of_destination.bytes": {
                        "value": 754252.0
                      },
                      "sum_of_source.bytes": {
                        "value": 343078.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 156,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.96054036505162,
                          "lon": 22.273298028963975
                        },
                        "count": 156
                      },
                      "sum_of_destination.bytes": {
                        "value": 3776.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14006.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 122,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.240000791343874,
                          "lon": 16.070247520539972
                        },
                        "count": 122
                      },
                      "sum_of_destination.bytes": {
                        "value": 6868.0
                      },
                      "sum_of_source.bytes": {
                        "value": 16430.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 111,
                      "sourceCentroid": {
                        "location": {
                          "lat": -22.56785135326051,
                          "lon": -43.31284599454218
                        },
                        "count": 111
                      },
                      "sum_of_destination.bytes": {
                        "value": 350058.0
                      },
                      "sum_of_source.bytes": {
                        "value": 134588.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 31,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.17498707068303,
                          "lon": -76.3930484367114
                        },
                        "count": 31
                      },
                      "sum_of_destination.bytes": {
                        "value": 14105.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9306.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 24,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 24
                      },
                      "sum_of_destination.bytes": {
                        "value": 1064.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2098.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.18092997465283,
                          "lon": -6.895860034972429
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1257.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 18,
                      "sourceCentroid": {
                        "location": {
                          "lat": -12.05000001937151,
                          "lon": -77.05000000074506
                        },
                        "count": 18
                      },
                      "sum_of_destination.bytes": {
                        "value": 43914.0
                      },
                      "sum_of_source.bytes": {
                        "value": 27456.0
                      }
                    },
                    {
                      "key": "3/1/2",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": 49.65849997010082,
                          "lon": -124.98350006528199
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 53572.0
                      },
                      "sum_of_source.bytes": {
                        "value": 38002.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.67234165268019,
                          "lon": 139.81434165732935
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 16899.0
                      },
                      "sum_of_source.bytes": {
                        "value": 12364.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1006.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 54.67602856058095,
                          "lon": 51.81894281080791
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 56.0
                      },
                      "sum_of_source.bytes": {
                        "value": 466.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.6666999803856,
                          "lon": 77.21669996157289
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 544.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T17:15:00.000Z",
                "key": 1603041300000,
                "doc_count": 2170,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 1541,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.29843853518371,
                          "lon": -121.8076298989254
                        },
                        "count": 1541
                      },
                      "sum_of_destination.bytes": {
                        "value": 1.0898556E7
                      },
                      "sum_of_source.bytes": {
                        "value": 1567905.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 260,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.611591124835495,
                          "lon": 117.63867880801598
                        },
                        "count": 260
                      },
                      "sum_of_destination.bytes": {
                        "value": 544412.0
                      },
                      "sum_of_source.bytes": {
                        "value": 277203.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 129,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.725094551437124,
                          "lon": 18.941805378079067
                        },
                        "count": 129
                      },
                      "sum_of_destination.bytes": {
                        "value": 56725.0
                      },
                      "sum_of_source.bytes": {
                        "value": 42042.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 108,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.81655552377924,
                          "lon": 16.458211089484394
                        },
                        "count": 108
                      },
                      "sum_of_destination.bytes": {
                        "value": 6456.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14760.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 30,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.603249973617494,
                          "lon": -74.17696005105972
                        },
                        "count": 30
                      },
                      "sum_of_destination.bytes": {
                        "value": 5339.0
                      },
                      "sum_of_source.bytes": {
                        "value": 4699.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1838.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": -14.929175020661205,
                          "lon": -69.48332500644028
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 37867.0
                      },
                      "sum_of_source.bytes": {
                        "value": 25634.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 13,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.79243073820208,
                          "lon": -5.197538470562834
                        },
                        "count": 13
                      },
                      "sum_of_destination.bytes": {
                        "value": 448.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1238.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 11,
                      "sourceCentroid": {
                        "location": {
                          "lat": 47.733972703784026,
                          "lon": 63.963009025901556
                        },
                        "count": 11
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 712.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 11.166699975728989,
                          "lon": 76.33329992182553
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 680.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68499998189509,
                          "lon": 139.75139999762177
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.594400000758469,
                          "lon": 106.78919998928905
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 41.79219997487962,
                          "lon": 123.43279995024204
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 45.31679998151958,
                          "lon": -73.8659000582993
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 248.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T17:30:00.000Z",
                "key": 1603042200000,
                "doc_count": 1455,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 878,
                      "sourceCentroid": {
                        "location": {
                          "lat": 37.32642390520751,
                          "lon": -121.3148986815808
                        },
                        "count": 878
                      },
                      "sum_of_destination.bytes": {
                        "value": 5838368.0
                      },
                      "sum_of_source.bytes": {
                        "value": 811359.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 216,
                      "sourceCentroid": {
                        "location": {
                          "lat": 31.57127682022595,
                          "lon": 117.95468931435607
                        },
                        "count": 216
                      },
                      "sum_of_destination.bytes": {
                        "value": 574697.0
                      },
                      "sum_of_source.bytes": {
                        "value": 338955.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 125,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.43943916980177,
                          "lon": 16.9949351786077
                        },
                        "count": 125
                      },
                      "sum_of_destination.bytes": {
                        "value": 22118.0
                      },
                      "sum_of_source.bytes": {
                        "value": 25778.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 115,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.76719128397172,
                          "lon": 19.368084303467818
                        },
                        "count": 115
                      },
                      "sum_of_destination.bytes": {
                        "value": 29180.0
                      },
                      "sum_of_source.bytes": {
                        "value": 25715.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 19,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 19
                      },
                      "sum_of_destination.bytes": {
                        "value": 392.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1556.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 17,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.625688248368747,
                          "lon": 55.61513524228597
                        },
                        "count": 17
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1270.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": 52.43069998919964,
                          "lon": -3.1685000471770763
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 16062.0
                      },
                      "sum_of_source.bytes": {
                        "value": 9594.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -17.15570001862943,
                          "lon": -69.99870001338422
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 15268.0
                      },
                      "sum_of_source.bytes": {
                        "value": 7550.0
                      }
                    },
                    {
                      "key": "3/7/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.68999999668449,
                          "lon": 139.68999995850027
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 620.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 10,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.10055998992175,
                          "lon": -76.42684006690979
                        },
                        "count": 10
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2092.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 7,
                      "sourceCentroid": {
                        "location": {
                          "lat": 16.99284282912101,
                          "lon": 77.24998564858522
                        },
                        "count": 7
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 434.0
                      }
                    },
                    {
                      "key": "3/6/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 43.879999998025596,
                          "lon": 125.32279992476106
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 372.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 55.44999998062849,
                          "lon": 65.3332999907434
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 290.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T17:45:00.000Z",
                "key": 1603043100000,
                "doc_count": 816,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/6/3",
                      "doc_count": 241,
                      "sourceCentroid": {
                        "location": {
                          "lat": 29.242055158544318,
                          "lon": 117.01834601848637
                        },
                        "count": 241
                      },
                      "sum_of_destination.bytes": {
                        "value": 591572.0
                      },
                      "sum_of_source.bytes": {
                        "value": 402839.0
                      }
                    },
                    {
                      "key": "3/1/3",
                      "doc_count": 210,
                      "sourceCentroid": {
                        "location": {
                          "lat": 35.67916950230886,
                          "lon": -116.58803671704871
                        },
                        "count": 210
                      },
                      "sum_of_destination.bytes": {
                        "value": 2065153.0
                      },
                      "sum_of_source.bytes": {
                        "value": 90317.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 112,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.438541039824486,
                          "lon": 16.882989266388385
                        },
                        "count": 112
                      },
                      "sum_of_destination.bytes": {
                        "value": 6052.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14634.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 108,
                      "sourceCentroid": {
                        "location": {
                          "lat": 50.27280275360681,
                          "lon": 19.996871252078563
                        },
                        "count": 108
                      },
                      "sum_of_destination.bytes": {
                        "value": 34981.0
                      },
                      "sum_of_source.bytes": {
                        "value": 27493.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 37,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.6190054176022874,
                          "lon": 55.623264808862196
                        },
                        "count": 37
                      },
                      "sum_of_destination.bytes": {
                        "value": 952.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2920.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 29,
                      "sourceCentroid": {
                        "location": {
                          "lat": -21.404551749984766,
                          "lon": -63.073868992385165
                        },
                        "count": 29
                      },
                      "sum_of_destination.bytes": {
                        "value": 69061.0
                      },
                      "sum_of_source.bytes": {
                        "value": 43514.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 27,
                      "sourceCentroid": {
                        "location": {
                          "lat": 28.466762939157586,
                          "lon": -70.74697413171332
                        },
                        "count": 27
                      },
                      "sum_of_destination.bytes": {
                        "value": 22343.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14329.0
                      }
                    },
                    {
                      "key": "3/3/3",
                      "doc_count": 20,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.41719997301698,
                          "lon": -3.684000000357628
                        },
                        "count": 20
                      },
                      "sum_of_destination.bytes": {
                        "value": 560.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1780.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -6.594400000758469,
                          "lon": 106.78919998928905
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 320.0
                      }
                    },
                    {
                      "key": "3/5/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 56.85749997384846,
                          "lon": 60.612499974668026
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 340.0
                      }
                    },
                    {
                      "key": "3/3/4",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": -14.788900036364794,
                          "lon": -39.046500055119395
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 340.0
                      }
                    },
                    {
                      "key": "3/3/2",
                      "doc_count": 5,
                      "sourceCentroid": {
                        "location": {
                          "lat": 51.514199981465936,
                          "lon": -0.0931000616401434
                        },
                        "count": 5
                      },
                      "sum_of_destination.bytes": {
                        "value": 280.0
                      },
                      "sum_of_source.bytes": {
                        "value": 580.0
                      }
                    },
                    {
                      "key": "3/5/3",
                      "doc_count": 2,
                      "sourceCentroid": {
                        "location": {
                          "lat": 12.98329995945096,
                          "lon": 77.58329993113875
                        },
                        "count": 2
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 124.0
                      }
                    }
                  ]
                }
              },
              {
                "key_as_string": "2020-10-18T18:00:00.000Z",
                "key": 1603044000000,
                "doc_count": 131,
                "sourceGrid": {
                  "buckets": [
                    {
                      "key": "3/1/3",
                      "doc_count": 45,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.509639979340136,
                          "lon": -115.69894893281162
                        },
                        "count": 45
                      },
                      "sum_of_destination.bytes": {
                        "value": 191756.0
                      },
                      "sum_of_source.bytes": {
                        "value": 14293.0
                      }
                    },
                    {
                      "key": "3/6/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 26.306268157310445,
                          "lon": 116.13189540041441
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 33493.0
                      },
                      "sum_of_source.bytes": {
                        "value": 24597.0
                      }
                    },
                    {
                      "key": "3/4/3",
                      "doc_count": 22,
                      "sourceCentroid": {
                        "location": {
                          "lat": 36.47273633586751,
                          "lon": 17.015027251433242
                        },
                        "count": 22
                      },
                      "sum_of_destination.bytes": {
                        "value": 1088.0
                      },
                      "sum_of_source.bytes": {
                        "value": 2740.0
                      }
                    },
                    {
                      "key": "3/4/2",
                      "doc_count": 15,
                      "sourceCentroid": {
                        "location": {
                          "lat": 53.24378664046526,
                          "lon": 19.65074661746621
                        },
                        "count": 15
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 1146.0
                      }
                    },
                    {
                      "key": "3/5/4",
                      "doc_count": 12,
                      "sourceCentroid": {
                        "location": {
                          "lat": -4.583300007507205,
                          "lon": 55.66669992171228
                        },
                        "count": 12
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 720.0
                      }
                    },
                    {
                      "key": "3/2/2",
                      "doc_count": 6,
                      "sourceCentroid": {
                        "location": {
                          "lat": 42.88639997597784,
                          "lon": -78.87810003943741
                        },
                        "count": 6
                      },
                      "sum_of_destination.bytes": {
                        "value": 336.0
                      },
                      "sum_of_source.bytes": {
                        "value": 348.0
                      }
                    },
                    {
                      "key": "3/6/4",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": -7.447800035588443,
                          "lon": 112.7182999625802
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 272.0
                      }
                    },
                    {
                      "key": "3/2/3",
                      "doc_count": 4,
                      "sourceCentroid": {
                        "location": {
                          "lat": 40.72139998432249,
                          "lon": -74.00520008057356
                        },
                        "count": 4
                      },
                      "sum_of_destination.bytes": {
                        "value": 224.0
                      },
                      "sum_of_source.bytes": {
                        "value": 232.0
                      }
                    },
                    {
                      "key": "3/2/4",
                      "doc_count": 1,
                      "sourceCentroid": {
                        "location": {
                          "lat": -23.952900026924908,
                          "lon": -46.3561000674963
                        },
                        "count": 1
                      },
                      "sum_of_destination.bytes": {
                        "value": 0.0
                      },
                      "sum_of_source.bytes": {
                        "value": 62.0
                      }
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
}

