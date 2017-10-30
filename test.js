'use strict'

const test = require('tape')

const shapes = require('.')
const {pathForShape} = shapes

const friedrichstr = '900000100001'
const doesNotExist = '123456789012'
// todo: this might break
const someShape = 's_wfs_alkis_bauwerkeflaechen.F118__173808'

test('shapes: should throw if not used properly', (t) => {
	t.plan(2)
	t.throws(() => shapes())
	t.throws(() => shapes(''))
})

test('shapes: should return an empty array for non-existent stations', (t) => {
	t.plan(1)
	t.deepEqual(shapes(doesNotExist, 'subway'), [])
})

test('shapes: should return a list of shapes', (t) => {
	const list = shapes(friedrichstr, 'subway')
	for (let shapeId of list) {
		t.ok(shapeId)
		t.equal(typeof shapeId, 'string')
	}
	t.end()
})

test('pathForShape: should throw if not used properly', (t) => {
	t.plan(2)
	t.throws(() => pathForShape())
	t.throws(() => pathForShape(''))
})

test('pathForShape: should return a valid GeoJSON shape file', (t) => {
	t.plan(3)
	const path = pathForShape(someShape)
	t.ok(path)
	t.equal(typeof path, 'string')
	if ('string' === typeof path) {
		const shape = require(path)
		t.ok(shape)
		// todo: test if valid GeoJSON
	}
})
