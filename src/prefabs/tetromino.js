import { world } from "../globals.js"
import { Tetrimino, Direction } from "../tetris.js"
import { Container, Graphics } from "pixi.js"
import Sprite from "../components/sprite.js"
import Position from "../components/position.js"
import Tetromino from "../components/tetromino.js"

/**
 * @param {Tetrimino} tetrimino
 * @param {Direction} direction
 */
export default function makeTetromino(tetrimino, direction) {
	let e = world.createEntity()
	let graphics = new Container()
	let shape = tetrimino.shape.get(direction)
	let w = innerHeight / 2.3,
		h = 2 * w,
		cell = w / 10
	/** @type {ecsy.Entity} */
	let board = window.tetrisBoard
	let { graphics: boardGraphics } = board.getComponent(Sprite)

	for (const offset of shape) {
		let g = new Graphics()
		g.beginFill(tetrimino.color.hex).drawRect(0, 0, cell, cell)
		g.position = offset.clone().scale(cell)
		graphics.addChild(g)
	}

	e.addComponent(Sprite, { graphics, parent: boardGraphics })
		.addComponent(Position)
		.addComponent(Tetromino, {
			tetrimino,
			direction,
		})
	return e
}
