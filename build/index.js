'use strict'

const path = require('path')
const fs = require('fs')
const createQueue = require('queue')
const hash = require('shorthash').unique

const findStationForShape = require('./find-station-for-shape')
const shapesStream = require('./shapes-stream')
const catCodes = require('./cat-codes')

const showError = (err) => {
	console.error(err)
	process.exit(1)
}

const dir = path.join(__dirname, '..', 's')
const writeShape = (file, shape, cb) => {
	const dest = path.join(dir, file)
	fs.writeFile(dest, JSON.stringify(shape), cb)
}

const processResult = (result, cb) => {
	const product = catCodes[result.railwayCat.id]
	let stationId

	try {
		stationId = findStationForShape(result.id, result.shape, product, result.name)
	} catch (err) {
		return cb(err)
	}

	const file = hash(result.id) + '.json'
	const data = Object.assign({id: result.id, product}, result.shape)
	writeShape(file, data, (err) => {
		if (err) return cb(err)
		cb(null, {
			station: stationId,
			file,
			product
		})
	})
}

const shapeIDs = Object.create(null) // arrays, by station ID

const processBbox = (bbox) => {
	const job = (cb) => {
		console.info(bbox.join(' '))

		const s = shapesStream(bbox)
		s.once('error', (err) => {
			s.destroy()
			cb(err)
		})

		s.on('data', (data) => {
			processResult(data, (err, res) => {
				if (err) return console.error(err && err.message || (err + ''))

				let l = shapeIDs[res.station]
				if (!l) l = shapeIDs[res.station] = []
				if (!l.some(x => x.file === res.file)) {
					l.push({file: res.file, product: res.product})
				}
				console.info(res.station, '->', res.file)
			})
		})
		s.once('end', () => cb())
	}

	job.title = bbox.join(',')
	return job
}

const queue = createQueue({
	concurrency: 4,
	autostart: true
})
queue.on('error', showError)

const berlin = [416868 - 10, 5799302 + 10, 369095 + 10, 5838240 - 10]
const [maxX, minY, minX, maxY] = berlin
const dX = (maxX - minX) / 40
const dY = (maxY - minY) / 40
for (let x = minX; x < maxX; x += dX) {
	for (let y = minY; y < maxY; y += dY) {
		const tile = [
			Math.floor(x + dX), // max X
			Math.floor(y), // min Y
			Math.floor(x), // min X
			Math.floor(y + dY) // max Y
		]

		queue.push(processBbox(tile))
	}
}

queue.once('end', () => {
	const dest = path.join(__dirname, '..', 'list.json')
	fs.writeFile(dest, JSON.stringify(shapeIDs), (err) => {
		if (err) showError(err)
	})
})
