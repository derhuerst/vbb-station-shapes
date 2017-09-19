'use strict'

const shapesStream = require('./shapes-stream')

const leopoldplatz = [388800, 5823020, 388670, 5823135] // todo: whole of Berlin

shapesStream(leopoldplatz)
.on('data', (s) => {
	console.log(s)
})
.on('error', (err) => {
	console.error(err)
	process.exitCode = 1
})
