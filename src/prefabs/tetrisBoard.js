import { Graphics } from "pixi.js"
import { world } from "../globals.js"
import { range, getBoardDimensions } from "../tools.js"
import Position from "../components/position.js"
import Sprite from "../components/sprite.js"
import { TetrisBoard } from "../components/tags.js"

/**
 * @returns {ecsy.Entity}
 */
export default function makeTetrisBoard() {
	let e = world.createEntity()
	let xOffset = innerWidth / 4
	let { width: w, height: h, cell } = getBoardDimensions()
	let g = new Graphics()
	let mask = new Graphics()

	// draw the borders
	g.lineStyle(2, 0xffffff)
		.moveTo(-1, -1)
		.lineTo(-1, h + 1)
		.moveTo(w + 1, -1)
		.lineTo(w + 1, h + 1)
		.lineStyle(2, 0xffff00)
		.moveTo(-1, h + 1)
		.lineTo(w + 1, h + 1)
		.lineStyle(2, 0x00ffff)
		.moveTo(-1, -1)
		.lineTo(w + 1, -1)
		.lineStyle(1, 0xffffff, 0.4)

	// set mask
	mask.beginFill(0xff0000).drawRect(-5, -5, w + 10, h + 10)
	g.addChild(mask)
	g.mask = mask

	// inverse Y so (0,0) is bottom left
	g.scale.y = -1

	e.addComponent(Position, {
		x: xOffset - w / 2,
		y: innerHeight / 2 + w,
	})
	e.addComponent(Sprite, { graphics: g })
	e.addComponent(TetrisBoard)
	e.name = "Tetris Board"

	return e
}
