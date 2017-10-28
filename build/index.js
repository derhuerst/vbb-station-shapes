'use strict'

const getStations = require('vbb-stations')
const path = require('path')
const fs = require('fs')
const linesAt = require('vbb-lines-at')
const distance = require('gps-distance')
const shorten = require('vbb-short-station-name')
const leven = require('leven')
const centroid = require('@turf/centroid')
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

// see merge-vbb-stations for a more advanced algorithm
// https://github.com/derhuerst/merge-vbb-stations/blob/c6718dad00673bb250d1d16e63ccde4e6887f78d/index.js#L14-L71
const findStationForShape = (result, cb) => {
	const center = centroid(result.shape)
	const [cLon, cLat] = center.geometry.coordinates
	const rName = result.name ? shorten(result.name) : null

	const closeBy = []
	for (let station of allStations) {
		const lines = linesAt[station.id]
		const hasSubway = lines && lines.some(l => l.product === 'subway')
		if (!hasSubway) continue

		const s = station.coordinates
		const km = distance(cLat, cLon, s.latitude, s.longitude)
		if (km > .25) continue

		if (km < .1) closeBy.push(station) // <100m
		else if (rName) {
			const d = leven(rName, station.name)
			if (d <= 2) closeBy.push(station)
		}

		if (closeBy.length > 1) {
			return cb(new Error(result.id + ' has more than 1 close-by station.'))
		}
	}

	const station = closeBy[0]
	if (!station) {
		if (!rName) {
			return cb(new Error(result.id + ' has no name to identify it by'))
		}
		return cb(new Error(result.id + ' has no close-by station'))
	}
	writeShape(station.id, result.shape, (err) => {
		if (err) return cb(err)
		cb(null, {station: station.id, shape: result.id})
	})
}

const stationIDs = new Set()
const processBbox = (bbox) => {
	const job = (cb) => {
		const s = shapesStream(bbox)
		s.once('error', (err) => {
			s.destroy()
			cb(err)
		})

		s.on('data', (data) => {
			findStationForShape(data, (err, result) => {
				if (err) console.error(err.message || (err + ''))
				else {
					stationIDs.add(result.station)
					console.info(result.station, '->', result.shape)
				}
			})
		})
		s.once('end', () => cb())
	}

	job.title = bbox.join(',')
	return job
}

const queue = createQueue({
	concurrency: 4,
	autostart: true
})
queue.on('error', showError)

const berlin = [416868 - 10, 5799302 + 10, 369095 + 10, 5838240 - 10]
const [maxX, minY, minX, maxY] = berlin
const dX = (maxX - minX) / 40
const dY = (maxY - minY) / 40
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

queue.once('end', () => {
	const dest = path.join(__dirname, 'list.json')
	fs.writeFile(dest, JSON.stringify(Array.from(stationIDs)), (err) => {
		if (err) showError(err)
	})
})
