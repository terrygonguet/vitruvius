import { Container, Graphics } from "pixi.js"
import Data from "../components/data.js"
import EventTarget from "../components/eventTarget.js"
import Position from "../components/position.js"
import Sprite from "../components/sprite.js"
import Tetromino from "../components/tetromino.js"
import { world } from "../globals.js"
import TetrisSystem from "../systems/tetris.js"
import { Direction, Tetrimino } from "../tetris.js"

/**
 * @param {Tetrimino} tetrimino
 * @param {Direction} direction
 */
export default function makeTetromino(tetrimino, direction = Direction.North) {
	let e = world.createEntity("Tetromino")
	let ghost = world.createEntity("Breakout Tetromino")
	let graphics = new Container()
	let ghostGraphics = new Container()
	let shape = tetrimino.shape.get(direction)
	let w = innerHeight / 2.3,
		h = 2 * w,
		cell = w / 10
	/** @type {ecsy.Entity} */
	let tetrisBoard = window.tetrisBoard
	let { graphics: tetrisContainer } = tetrisBoard.getComponent(Sprite)
	/** @type {ecsy.Entity} */
	let breakoutBoard = window.breakoutBoard
	let { graphics: breakoutContainer } = breakoutBoard.getComponent(Sprite)

	for (const offset of shape) {
		let g = new Graphics()
		g.beginFill(tetrimino.color.hex).drawRect(0, 0, cell, cell)
		let clone = g.clone()
		clone.position = g.position = offset.clone().scale(cell)
		graphics.addChild(g)
		ghostGraphics.addChild(clone)
	}

	e.addComponent(Sprite, { graphics, parent: tetrisContainer })
		.addComponent(Position)
		.addComponent(Tetromino, {
			tetrimino,
			direction,
		})
		.addComponent(Data, { ghost })
		.addComponent(EventTarget)
	ghost
		.addComponent(Sprite, {
			graphics: ghostGraphics,
			parent: breakoutContainer,
		})
		.addComponent(Position)

	/** @type {TetrisSystem} */
	let { minoManager } = world.getSystem(TetrisSystem)
	let evt = e.getComponent(EventTarget)

	evt.addEventListener("tick", () => {
		let pos = e.getComponent(Position)
		let ghostPos = ghost.getMutableComponent(Position)
		ghostPos.copy(pos).y += minoManager.breakoutOffset * cell
	})

	evt.addEventListener("removed", () => {
		ghost.remove()
	})
	return e
}
