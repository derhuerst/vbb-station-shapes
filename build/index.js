'use strict'

const fs = require('fs')
const path = require('path')
const createPath = require('svgpath')
const h = require('virtual-dom/virtual-hyperscript/svg')
const omit = require('lodash.omit')
const pdf = require('pdfjs-dist')
const toString = require('virtual-dom-stringify')

const extractShapes = require('./extract-shapes')

// const data = fs.readFileSync(path.join(__dirname, '9009202.pdf'))
const data = fs.readFileSync(path.join(__dirname, '9014101.pdf'))

// const HOUSE = 'rgb(133,134,138)'
// const BUS_STOP = 'rgb(158,42,150)'
const SUBWAY_LINE = 'rgb(0,110,184)'

const ENTRY = 'rgb(170,205,234)'
const STATION = 'rgb(88,158,210)'
const filterShapes = (ctx) => {
	// todo: parse
	return ctx.strokeColor === ENTRY
	|| ctx.strokeColor === STATION
	|| ctx.strokeColor === SUBWAY_LINE
}

// alternative: https://github.com/TrySound/postcss-value-parser
const normalizeShape = (ctx, group, svg) => {
	if (!ctx.d) throw new Error('failed to normalize shape, missing d attribute')

	const p = createPath(ctx.d)
	if (svg.transform) p.transform(svg.transform)
	if (group.transform) p.transform(group.transform)
	if (ctx.transform) p.transform(ctx.transform)

	return p.abs().round(.3).toString()
}

const createSVGPath = ([ctx, group, svg]) => {
	const a = Object.assign({}, omit(group, ['transform']), omit(ctx, ['transform']))
	a.d = normalizeShape(ctx, group, svg)

	return h('path', a)
}

pdf.getDocument(data)
.then((doc) => doc.getPage(1))
.then((page) => extractShapes(page, filterShapes))
.then((shapes) => {
	const svg = `\
	<svg width="500" height="500" viewBox="0 0 2000 2000" xmlns="http://www.w3.org/2000/svg">
		${shapes.map(createSVGPath).map(toString).join('\n')}
	</svg>`
	fs.writeFileSync(path.join(__dirname, '../foo.svg'), svg)
})
.catch((err) => {
	console.error(err)
	process.exit(1)
})
