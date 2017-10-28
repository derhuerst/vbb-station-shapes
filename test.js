'use strict'

const test = require('tape')

const pathForShape = require('.')

const friedrichstr = '900000100001'
const doesNotExist = '123456789012'

test('should throw if not used properly', (t) => {
	t.plan(2)
	t.throws(() => pathForShape())
	t.throws(() => pathForShape(''))
})

test('should return null if shape does not exist', (t) => {
	t.plan(1)
	t.equal(pathForShape(doesNotExist), null)
})

test('should return a valid GeoJSON shape file', (t) => {
	t.plan(3)
	const path = pathForShape(friedrichstr)
	t.ok(path)
	t.equal(typeof path, 'string')
	if ('string' === typeof path) {
		const shape = require(path)
		t.ok(shape)
		// todo: test if valid GeoJSON
	}
})
