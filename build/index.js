'use strict'

const getStations = require('vbb-stations')
const path = require('path')
const fs = require('fs')
const linesAt = require('vbb-lines-at')
const distance = require('gps-distance')
const centroid = require('@turf/centroid')
const through = require('through2')
const createQueue = require('queue')

const shapesStream = require('./shapes-stream')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const allStations = getStations('all')

const dir = path.join(__dirname, '..', 's')
const writeShape = (id, shape, cb) => {
	const dest = path.join(dir, id + '.json')
	fs.writeFile(dest, JSON.stringify(shape), cb)
}

const onShape = (result, _, cb) => {
	const center = centroid(result.shape)
	const [cLon, cLat] = center.geometry.coordinates

	const closeBy = []
	for (let station of allStations) {
		const lines = linesAt[station.id]
		const hasSubway = lines && lines.some(l => l.product === 'subway')
		if (!hasSubway) continue

		const s = station.coordinates
		const d = distance(cLat, cLon, s.latitude, s.longitude)
		// todo: take the Levenshtein distance into account
		// currently it fails with Hallesches Tor U6
		if (d < .1) closeBy.push(station) // <100m

		if (closeBy.length > 1) {
			return cb(new Error(result.id + ' has more than 1 close-by station.'))
		}
	}

	const station = closeBy[0]
	if (!station) {
		return cb(new Error(result.id + ' has no close-by station'))
	}
	writeShape(station.id, result.shape, (err) => {
		if (err) return cb(err)
		console.info(station.id, '->', result.id)
		cb()
	})
}

// todo: store all in one additional file
const processBbox = (bbox) => {
	const job = (cb) => {
		const s = shapesStream(bbox)
		s.once('error', (err) => {
			s.destroy()
			cb(err)
		})

		// todo: use a stream.Writable instead of through
		const t = s.pipe(through.obj(onShape))
		t.on('data', () => {})
		t.on('error', (err) => {
			console.error(err.message || (err + ''))
			process.exitCode = 1
		})
		t.once('end', () => cb())
	}

	job.title = bbox.join(',')
	return job
}

const queue = createQueue({
	concurrency: 1, // todo
	autostart: true
})
queue.on('error', showError)

const berlin = [416868 - 10, 5799302 + 10, 369095 + 10, 5838240 - 10]
const [maxX, minY, minX, maxY] = berlin
const dX = (maxX - minX) / 20
const dY = (maxY - minY) / 20
for (let x = minX; x < maxX; x += dX) {
	for (let y = minY; y < maxY; y += dY) {
		const tile = [
			Math.floor(x + dX), // max X
			Math.floor(y), // min Y
			Math.floor(x), // min X
			Math.floor(y + dY) // max Y
		]

		queue.push(processBbox(tile))
	}
}
