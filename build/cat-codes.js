'use strict'

const catCodes = Object.create(null)

catCodes.subway = '1202'
catCodes['1202'] = 'subway'

catCodes.suburban = '1104'
catCodes['1104'] = 'suburban'

// todo: might also be express
catCodes.regional = '1100'
catCodes['1100'] = 'regional'

module.exports = catCodes
