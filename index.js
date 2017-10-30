'use strict'

const path = require('path')

const shapeIds = require('./list.json')

const dir = path.join(__dirname, 's')

const pathForShape = (shapeId) => {
	if ('string' !== typeof shapeId) throw new Error('shapeId must be a string')
	if (shapeId.length === 0) throw new Error('shapeId is invalid')
	return path.join(dir, shapeId + '.json')
}

const shapes = (station, product = null) => {
	if ('string' !== typeof station) throw new Error('station must be a string')
	if (station.length === 0) throw new Error('station is invalid')

	let results = shapeIds[station] || []
	if (product) results = results.filter(r => r.product === product)
	return results.map(r => r.shape)
}

shapes.pathForShape = pathForShape
module.exports = shapes
