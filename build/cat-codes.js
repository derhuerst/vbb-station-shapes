'use strict'

const catCodes = Object.create(null)
catCodes.subway = '1202'
catCodes.suburban = '1104'
catCodes['1202'] = 'subway'
catCodes['1104'] = 'suburban'

module.exports = catCodes
