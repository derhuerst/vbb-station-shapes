'use strict'

const path = require('path')
const fs = require('fs')
const distance = require('gps-distance')
const centroid = require('@turf/centroid')
const getStations = require('vbb-stations')
const through = require('through2')

const shapesStream = require('./shapes-stream')

const showError = (err) => {
	console.error(err)
	process.exitCode = 1
}

const dir = path.join(__dirname, '..', 's')
const writeShape = (id, shape, cb) => {
	const dest = path.join(dir, id + '.json')
	fs.writeFile(dest, JSON.stringify(shape), cb)
}

const allStations = getStations('all')
const berlin = [416868 - 10, 5799302 + 10, 369095 + 10, 5838240 - 10]

// todo: store all in one additional file

shapesStream(berlin)
.on('error', showError)
.pipe(through.obj((result, _, cb) => {
	const center = centroid(result.shape)
	const [cLon, cLat] = center.geometry.coordinates

	const closeBy = []
	for (let station of allStations) {
		const s = station.coordinates
		const d = distance(cLat, cLon, s.latitude, s.longitude)
		if (d < .1) closeBy.push(station) // <100m

		if (closeBy.length > 1) {
			return cb(new Error(result.id + ' has more than 1 close-by station.'))
		}
	}

	const station = closeBy[0]
	writeShape(station.id, result.shape, (err) => {
		if (err) return cb(err)
		console.info(station.id, '->', result.id)
		cb(null)
	})
}))
.on('data', () => {})
.on('error', showError)
