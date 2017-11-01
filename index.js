'use strict'

const path = require('path')

const shapeIds = require('./list.json')

const dir = path.join(__dirname, 's')

const pathForShape = (file) => {
	if ('string' !== typeof file) throw new Error('file must be a string')
	if (file.length === 0) throw new Error('file is invalid')
	return path.join(dir, file)
}

const shapes = (station, product = null) => {
	if ('string' !== typeof station) throw new Error('station must be a string')
	if (station.length === 0) throw new Error('station is invalid')

	let results = shapeIds[station] || []
	if (product) results = results.filter(r => r.product === product)
	return results.map(r => r.file)
}

shapes.pathForShape = pathForShape
module.exports = shapes
