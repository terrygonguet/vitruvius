import { Graphics } from "pixi.js"
import { world } from "../globals.js"
import { range, getBoardDimensions } from "../tools.js"
import Position from "../components/position.js"
import Sprite from "../components/sprite.js"
import { TetrisBoard, BreakoutBoard } from "../components/tags.js"

/**
 * @param {"left" | "right"} position
 * @returns {ecsy.Entity}
 */
export default function makeBoard(position = "left") {
	let e = world.createEntity()
	let xOffset = (position == "left" ? 1 : 3) * (innerWidth / 4)
	let { width: w, height: h, cell } = getBoardDimensions()
	let g = new Graphics()

	// draw the borders
	g.lineStyle(2, 0xffffff)
		.drawRect(-1, -1, w + 2, h + 2)
		.lineStyle(1, 0xffffff, 0.4)

	// inverse Y so (0,0) is bottom left
	g.scale.y = -1

	// draw grid
	for (const i of range(1, 9)) {
		g.moveTo(i * cell, 0).lineTo(i * cell, h)
	}
	for (const j of range(1, 19)) {
		g.moveTo(0, j * cell).lineTo(w, j * cell)
	}

	e.addComponent(Position, {
		x: xOffset - w / 2,
		y: innerHeight / 2 + w,
	})
	e.addComponent(Sprite, { graphics: g })
	e.addComponent(position == "left" ? TetrisBoard : BreakoutBoard)

	return e
}
