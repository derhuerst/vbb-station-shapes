'use strict'

const {getItems} = require('alkis-berlin-client')
const {findIn, textOf} = require('alkis-berlin-client/lib/helpers')
const filter = require('stream-filter')

const catCodes = require('./cat-codes')

const parseRailwayCat = (s) => {
	return {
		id: textOf(findIn(s, 'fis:Bahnkategorie_schluessel')) || null,
		name: textOf(findIn(s, 'fis:Bahnkategorie_bezeichnung')) || null
	}
}
const parseTrainStationCat = (s) => {
	return {
		id: textOf(findIn(s, 'fis:Bahnhofskategorie_schluessel')) || null,
		// note the typo!
		name: textOf(findIn(s, 'fis:Bahnhofskategorie_bezeichnug')) || null
	}
}
const additionalFields = {
	railwayCat: parseRailwayCat,
	trainStationCat: parseTrainStationCat
}

const haltestelle = '1020'
const bahnhof = '1010'
const isValidStation = (s) => (
	s.aaa === 'AX_Bahnverkehrsanlage' &&
	(s.trainStationCat.id === haltestelle || s.trainStationCat.id === bahnhof) &&
	(s.railwayCat.id in catCodes)
)

const layer = 'fis:s_wfs_alkis_bauwerkeflaechen'
const createShapesStream = (bbox) => {
	const [west, south, east, north] = bbox
	if (west <= east) throw new Error('west must be larger than east.')
	if (north <= south) throw new Error('north must be larger than south.')

	const src = getItems(layer, bbox, {fields: additionalFields})
	const dest = filter.obj(isValidStation)

	src.pipe(dest)
	src.on('error', (err) => {
		dest.emit('error', err)
	})

	return dest
}

module.exports = createShapesStream
