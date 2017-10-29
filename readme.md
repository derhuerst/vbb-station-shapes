# vbb-station-shapes

**Shapefiles for Berlin public transport stations**, extracted from [the cadastral map of Berlin](https://fbinter.stadt-berlin.de/fb/index.jsp?loginkey=zoomStart&mapId=wmsk_alkis@senstadt&bbox=390525,5817516,390903,5817739). Because VBB/BVG don't provide them. :angry:

[![npm version](https://img.shields.io/npm/v/vbb-station-shapes.svg)](https://www.npmjs.com/package/vbb-station-shapes)
[![build status](https://img.shields.io/travis/derhuerst/vbb-station-shapes.svg)](https://travis-ci.org/derhuerst/vbb-station-shapes)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-station-shapes.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)


## Installing

```shell
npm install vbb-station-shapes
```


## Usage

When called with a station ID, `vbb-station-shapes` returns a path to a [GeoJSON](http://geojson.org/) shape file.

```js
const pathForShape = require('vbb-station-shapes')

const ruhleben = '900000025202'
const path = pathForShape(ruhleben)
console.log(path)
```

```
/Users/j/web/vbb-station-shapes/s/900000025202.json
```

You may `require` this file or load it in any other way.

```js
const shape = require(path)
console.log(shape)
```

```js
{
	type: 'MultiPolygon',
	coordinates: [[[
		[ 13.242004, 52.525428 ],
		[ 13.242044, 52.525483 ],
		[ 13.242046, 52.525488 ],
		[ 13.241935, 52.525522 ],
		[ 13.241822, 52.525555 ],
		[ 13.241709, 52.525588 ],
		[ 13.241595, 52.52562 ],
		[ 13.24148, 52.52565 ],
		[ 13.241365, 52.52568 ],
		[ 13.241249, 52.525709 ],
		[ 13.241132, 52.525736 ],
		[ 13.241015, 52.525763 ],
		[ 13.240897, 52.525789 ],
		[ 13.240778, 52.525814 ],
		[ 13.240659, 52.525837 ],
		[ 13.24054, 52.52586 ],
		[ 13.240537, 52.525856 ],
		[ 13.240496, 52.525795 ],
		[ 13.240494, 52.525791 ],
		[ 13.240659, 52.525746 ],
		[ 13.240825, 52.525703 ],
		[ 13.240991, 52.525661 ],
		[ 13.241158, 52.525619 ],
		[ 13.241325, 52.525578 ],
		[ 13.241494, 52.525538 ],
		[ 13.241662, 52.525499 ],
		[ 13.241831, 52.525461 ],
		[ 13.242001, 52.525424 ],
		[ 13.242004, 52.525428 ]
	]]]
}
```


## Contributing

If you have a question or have difficulties using `vbb-station-shapes`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/vbb-station-shapes/issues).
