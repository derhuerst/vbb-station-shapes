'use strict'

require('./stubs')
const {SVGGraphics} = require('pdfjs-dist/lib/display/svg')

const extractShapes = (page, filterShapes) => {
	const shapes = []

	const check = (ctx, group, svg) => {
		if (filterShapes(ctx)) {
			const shape = ctx.element
			shapes.push([shape.attributes, group.attributes, svg.attributes])
		}
	}

	// todo: this.current.textMatrix
	// todo: this.current.fontMatrix
	// todo: this.current.x, this.current.y
	// todo: this.current.lineX, this.current.lineY
	// todo: this.current.lineWidth
	// todo: this.current.dependencies
	// todo: this.svg
	// todo: this.current.clipGroup.attributes['clip-group']
	// todo: this.current.activeClipUrl
	class Renderer extends SVGGraphics {
		stroke () {
			check(this.current, this.tgrp, this.svg)
			return super.stroke()
		}
		fill () {
			check(this.current, this.tgrp, this.svg)
			return super.fill()
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
