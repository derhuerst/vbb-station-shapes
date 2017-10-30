'use strict'

const shapes = require('.')
const {pathForShape} = shapes

const sWedding = '900000009104'

const [path] = shapes(sWedding, 'subway')
const shape = require(pathForShape(path))
console.log(shape)
