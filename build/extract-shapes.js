'use strict'

require('./stubs')
const {SVGGraphics} = require('pdfjs-dist/lib/display/svg')

const extractShapes = (page, filterShapes) => {
	const shapes = []

	const check = (ctx, group) => {
		if (filterShapes(ctx)) {
			const shape = ctx.element
			shapes.push([shape.attributes, group.attributes])
		}
	}

	class Renderer extends SVGGraphics {
		stroke () {
			check(this.current, this.tgrp)
			return super.stroke()
		}
		fill () {
			check(this.current, this.tgrp)
			return super.fill()
		}
		eoFill () {
			check(this.current, this.tgrp)
			return super.eoFill()
		}
	}

	const viewport = page.getViewport(1.5)
	return page.getOperatorList()
	.then((ops) => {
		const renderer = new Renderer(page.commonObjs, page.objs)
		return renderer.getSVG(ops, viewport)
	})
	.then(() => shapes)
}

module.exports = extractShapes
