'use strict'

const fs = require('fs')
const path = require('path')
const pdf = require('pdfjs-dist')

const extractShapes = require('./extract-shapes')

const data = fs.readFileSync(path.join(__dirname, '9009202.pdf'))

const ENTRY = 'rgb(170,205,234)'
const STATION = 'rgb(88,158,210)'
const filterShapes = (ctx) => {
	return ctx.strokeColor === ENTRY || ctx.strokeColor === STATION // todo: parse
}

pdf.getDocument(data)
.then((doc) => doc.getPage(1))
.then((page) => extractShapes(page, filterShapes))
.then((shapes) => {
	console.log(shapes)
})
.catch((err) => {
	console.error(err)
})