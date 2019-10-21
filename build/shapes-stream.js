'use strict'

const pump = require('pump')
const {getItems} = require('alkis-berlin-client')
const {findIn, textOf} = require('alkis-berlin-client/lib/helpers')
const through = require('through2')

const layer = 'fis:s_wfs_alkis_bauwerkeflaechen'

const parseBuildingCat = (s) => {
	// todo: is there an alternative name?
	return textOf(findIn(s, 'fis:BWF')) || null
}
const parseFootpathCat = (s) => {
	// todo: is there an alternative name?
	return textOf(findIn(s, 'fis:ART')) || null
}
const parseRailwayCat = (s) => {
	return textOf(findIn(s, 'fis:Bahnkategorie_schluessel') || findIn(s, 'fis:BKT')) || null
}
const parseTrainStationCat = (s) => {
	return textOf(findIn(s, 'fis:Bahnhofskategorie_schluessel') || findIn(s, 'fis:BFK')) || null
}
const additionalFields = {
	buildingCat: parseBuildingCat,
	footpathCat: parseFootpathCat,
	railwayCat: parseRailwayCat,
	trainStationCat: parseTrainStationCat
}

const parseType = ({aaa, trainStationCat, buildingCat, footpathCat}) => {
	if (aaa === 'AX_Bahnverkehrsanlage') {
		if (trainStationCat === '1010') return 'station'
		if (trainStationCat === '1020') return 'stop'
	}
	if (aaa === 'AX_BauwerkImVerkehrsbereich' && buildingCat === '1870') {
		return 'tunnel'
	}
	if (aaa === 'AX_SonstigesBauwerkOderSonstigeEinrichtung') {
		if (buildingCat === '1610') return 'roof'
		if (buildingCat === '1620') return 'stairs'
	}
	if (aaa === 'AX_WegPfadSteig' && footpathCat === '1103') {
		return 'pathway'
	}
	return null
}

const createShapesStream = (bbox) => {
	const [west, south, east, north] = bbox
	if (west <= east) throw new Error('west must be larger than east.')
	if (north <= south) throw new Error('north must be larger than south.')

	return pump(
		getItems(layer, bbox, {fields: additionalFields}),
		through.obj((result, _, cb) => {
			cb(null, {...result, type: parseType(result)})
		}),
		(err) => {
			if (err) console.error(err)
		}
	)
}

module.exports = createShapesStream
