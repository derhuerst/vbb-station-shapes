'use strict'

const getStations = require('vbb-stations')
const centroid = require('@turf/centroid').default
const shorten = require('vbb-short-station-name')
const linesAt = require('vbb-lines-at')
const distance = require('gps-distance')
const leven = require('leven')

const allStations = getStations('all')

// see merge-vbb-stations for a more advanced algorithm
// https://github.com/derhuerst/merge-vbb-stations/blob/c6718dad00673bb250d1d16e63ccde4e6887f78d/index.js#L14-L71
const findStationForShape = (id, shape, product, name) => {
	const center = centroid(shape)
	const [cLon, cLat] = center.geometry.coordinates
	const rName = name ? shorten(name) : null

	const closeBy = []
	for (let station of allStations) {
		const lines = linesAt[station.id]
		const hasProduct = lines && lines.some(l => l.product === product)
		if (!hasProduct) continue

		const s = station.location
		const km = distance(cLat, cLon, s.latitude, s.longitude)
		if (km > .25) continue

		if (km < .1) closeBy.push(station) // <100m
		else if (rName) {
			const d = leven(rName, station.name)
			if (d <= 2) closeBy.push(station)
		}

		if (closeBy.length > 1) {
			throw new Error(id + ' has more than 1 close-by station.')
		}
	}

	const station = closeBy[0]
	if (!station) {
		if (!rName) throw new Error(id + ' has no name to identify it by')
		throw new Error(id + ' has no close-by station')
	}

	return station.id
}

module.exports = findStationForShape
