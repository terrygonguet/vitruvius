import { Color } from "../tetris.js"
import { world } from "../globals.js"
import { Graphics } from "pixi.js"
import { getBoardDimensions } from "../tools.js"
import Sprite from "../components/sprite.js"
import Position from "../components/position.js"

let { cell } = getBoardDimensions()

/**
 * @param {Object} options
 * @param {Position} options.position
 * @param {Color} options.color
 */
export function makeMino({ position, color }) {
	/** @type {ecsy.Entity} */
	let board = window.tetrisBoard
	let { graphics: boardGraphics } = board.getComponent(Sprite)
	let mino = world.createEntity()
	let g = new Graphics()
	g.beginFill(color.hex).drawRect(0, 0, cell, cell)
	mino.addComponent(Sprite, {
		graphics: g,
		parent: boardGraphics,
	}).addComponent(Position, position.clone().scale(cell))
	return mino
}
