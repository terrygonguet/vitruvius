import { matrix, width, bufferHeight, Color, height } from "../tetris.js"
import { range, getBoardDimensions } from "../tools.js"
import Sprite from "../components/sprite.js"
import { world } from "../globals.js"
import Position from "../components/position.js"
import { Graphics } from "pixi.js"
import Hitbox, { Group } from "../components/hitbox.js"
import SAT from "sat"

const { cell } = getBoardDimensions()

export default class MinoManager {
	/** @type {ecsy.Entity[]} */
	tetrisMinos = []
	/** @type {ecsy.Entity[]} */
	breakoutMinos = []
	/** @type {ecsy.Entity} */
	tetrisBoard
	/** @type {ecsy.Entity} */
	breakoutBoard
	breakoutOffset = 10

	init() {
		matrix.listen(this.listener.bind(this), true)
		this.tetrisMinos.forEach(e => e.remove())
		this.breakoutMinos.forEach(e => e.remove())
		this.tetrisMinos = new Array(width * bufferHeight).fill(undefined)
		this.breakoutMinos = new Array(width * bufferHeight).fill(undefined)
		this.tetrisBoard = window.tetrisBoard
		this.breakoutBoard = window.breakoutBoard

		// create the minos that exist already
		for (const y of range(0, bufferHeight - 1)) {
			for (const x of range(0, width - 1))
				this.setMinoColor(x, y, matrix.get(x, y))
		}
	}

	/**
	 * @param {import("../tetris").CellChangeEvent} e
	 */
	listener(e) {
		if (e.all) {
			for (const y of range(0, bufferHeight - 1)) {
				for (const x of range(0, width - 1))
					this.setMinoColor(x, y, matrix.get(x, y))
			}
		} else {
			this.setMinoColor(e.x, e.y, matrix.get(e))
		}
	}

	/**
	 * Sets the color of the mino at (x, y) and creates it if
	 * it doesn't exist
	 * @param {number} x
	 * @param {number} y
	 * @param {Color=} color
	 */
	setMinoColor(x, y, color) {
		let tetrisMino = this.tetrisMinos[y * width + x]
		let breakoutMino = this.breakoutMinos[y * width + x]
		// set mino in tetris board
		if (!tetrisMino && color) {
			let mino = world.createEntity()
			let { graphics: parent } = this.tetrisBoard.getComponent(Sprite)
			let graphics = new Graphics()
			graphics.beginFill(color.hex).drawRect(0, 0, cell, cell)
			mino.addComponent(Position, new Position(x, y).scale(cell))
			mino.addComponent(Sprite, { graphics, parent })
			this.tetrisMinos[y * width + x] = mino
		} else if (tetrisMino) {
			/** @type {{ graphics:PIXI.Graphics }} */
			const { graphics } = tetrisMino.getMutableComponent(Sprite)
			graphics.clear()
			if (color) graphics.beginFill(color.hex).drawRect(0, 0, cell, cell)
		}

		// set mino in breakout board
		if (y < this.breakoutOffset && !breakoutMino && color) {
			let mino = world.createEntity()
			let { graphics: parent } = this.breakoutBoard.getComponent(Sprite)
			let graphics = new Graphics()
			graphics.beginFill(color.hex).drawRect(0, 0, cell, cell)
			let hitbox = new SAT.Box(new Position(), cell, cell).toPolygon()
			mino.addComponent(
				Position,
				new Position(x, height - (this.breakoutOffset - y)).scale(cell),
			)
			mino.addComponent(Sprite, { graphics, parent })
			mino.addComponent(Hitbox, { value: hitbox, group: Group.mino })
			this.breakoutMinos[y * width + x] = mino
		} else if (breakoutMino) {
			/** @type {{ graphics:PIXI.Graphics }} */
			const { graphics } = breakoutMino.getMutableComponent(Sprite)
			graphics.clear()
			if (color) {
				graphics.beginFill(color.hex).drawRect(0, 0, cell, cell)
				breakoutMino.getMutableComponent(Hitbox).group = Group.mino
			} else breakoutMino.getMutableComponent(Hitbox).group = Group.none
		}
	}

	/**
	 * Hides the mino at (x, y)
	 * @param {number} x
	 * @param {number} y
	 */
	removeMino(x, y) {
		this.setMinoColor(x, y)
	}
}
