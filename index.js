'use strict'

const path = require('path')

const dir = path.join(__dirname, 's')

const pathForShape = (station) => {
	if ('string' !== typeof station) throw new Error('station must be a string')
	if (station.length === 0) throw new Error('station is invalid')

	return path.join(dir, station + '.json')
}

module.exports = pathForShape
