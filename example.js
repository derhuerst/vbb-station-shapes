'use strict'

const pathForShape = require('.')

const ruhleben = '900000025202'
const path = pathForShape(ruhleben)
const shape = require(path)
console.log(shape)
