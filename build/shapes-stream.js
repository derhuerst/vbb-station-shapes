'use strict'

const {getItems} = require('alkis-berlin-client')
const parseStructure = require('alkis-berlin-client/lib/parse-structure')
const {findIn, textOf} = require('alkis-berlin-client/lib/helpers')
const filter = require('stream-filter')

const catCodes = require('./cat-codes')

const parse = (s) => {
	const r = parseStructure(s)
	r.railwayCat = {
		id: textOf(findIn(s, 'fis:Bahnkategorie_schluessel')) || null,
		name: textOf(findIn(s, 'fis:Bahnkategorie_bezeichnung')) || null
	}
	r.trainStationCat = {
		id: textOf(findIn(s, 'fis:Bahnhofskategorie_schluessel')) || null,
		// note the typo!
		name: textOf(findIn(s, 'fis:Bahnhofskategorie_bezeichnug')) || null
	}
	return r
}

const isValidStation = (s) => (
	s.aaa === 'AX_Bahnverkehrsanlage' &&
	s.trainStationCat.id === '1020' &&
	(s.railwayCat.id in catCodes)
)

const layer = 'fis:s_wfs_alkis_bauwerkeflaechen'
const createShapesStream = (bbox) => {
	const [west, south, east, north] = bbox
	if (west <= east) throw new Error('west must be larger than east.')
	if (north <= south) throw new Error('north must be larger than south.')

	const src = getItems(layer, bbox, {parse})
	const dest = filter.obj(isValidStation)

	src.pipe(dest)
	src.on('error', (err) => {
		dest.emit('error', err)
	})

	return dest
}

module.exports = createShapesStream
