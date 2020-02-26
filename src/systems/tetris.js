import { System } from "ecsy"
import Tetromino from "../components/tetromino.js"
import Sprite from "../components/sprite.js"
import Position from "../components/position.js"
import { TetrisBoard } from "../components/tags.js"
import { getBoardDimensions } from "../tools.js"
import {
	queryTetromino,
	Tetrimino,
	moveTetromino,
	rotateTetromino,
	matrix,
	width,
	Color,
} from "../tetris.js"
import makeTetromino from "../prefabs/tetromino.js"
import { world } from "../globals.js"
import { Graphics } from "pixi.js"

class TetrisSystem extends System {
	static queries = {
		tetrominos: {
			components: [Tetromino],
			listen: { changed: true },
		},
		board: {
			components: [TetrisBoard],
		},
	}

	init() {
		this.fallSpeed = 1
		this.time = 0
		this.keys = {
			rotateCW: false,
			rotateCCW: false,
			softDrop: false,
			hardDrop: false,
			moveRight: false,
			moveLeft: false,
			hold: false,
			spawn: false,
		}
		this.keybinds = {
			ArrowUp: "rotateCW",
			Control: "rotateCCW",
			ArrowDown: "softDrop",
			" ": "hardDrop",
			ArrowRight: "moveRight",
			ArrowLeft: "moveLeft",
			Shift: "hold",
			z: "rotateCCW",
			x: "rotateCW",
			c: "hold",
			Enter: "spawn",
		}

		document.addEventListener("keydown", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = true
		})
		document.addEventListener("keyup", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = false
		})
	}

	execute(delta, time) {
		if (this.keys.spawn && !this.queries.tetrominos.results.length)
			makeTetromino(Tetrimino.I)

		this.time += delta
		let dropNow =
			this.time >= this.fallSpeed / (this.keys.softDrop ? 20 : 1)
		let { width: w, height: h, cell } = getBoardDimensions()

		this.queries.tetrominos.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let pos = e.getMutableComponent(Position)
				let tetromino = e.getComponent(Tetromino)

				if (this.keys.rotateCW) {
					Object.assign(
						e.getMutableComponent(Tetromino),
						rotateTetromino(tetromino, "clockwise"),
					)
					this.time = 0
					this.keys.rotateCW = false
				}
				if (this.keys.rotateCCW) {
					Object.assign(
						e.getMutableComponent(Tetromino),
						rotateTetromino(tetromino, "counterClockwise"),
					)
					this.time = 0
					this.keys.rotateCCW = false
				}
				if (dropNow) {
					try {
						Object.assign(
							tetromino,
							moveTetromino(tetromino, { x: 0, y: -1 }),
						)
					} catch (error) {
						let { position, direction, tetrimino } = tetromino
						let shape = tetrimino.shape
							.get(direction)
							.map(p => p.clone().add(position))
						/** @type {ecsy.Entity} */
						let board = this.queries.board.results[0]
						let { graphics: boardGraphics } = board.getComponent(
							Sprite,
						)
						shape.forEach(p => {
							let mino = world.createEntity()
							matrix[p.y * width + p.x] = mino
							let g = new Graphics()
							g.beginFill(Color.Gray.hex).drawRect(
								0,
								0,
								cell,
								cell,
							)
							mino.addComponent(Sprite, {
								graphics: g,
								parent: boardGraphics,
							}).addComponent(Position, p.scale(cell))
						})
						e.remove()
					} finally {
						this.time = 0
					}
				}
				let deltaX = this.keys.moveRight - this.keys.moveLeft
				if (deltaX) {
					try {
						Object.assign(
							tetromino,
							moveTetromino(tetromino, { x: deltaX, y: 0 }),
						)
					} catch (err) {
					} finally {
						this.keys.moveLeft = this.keys.moveRight = false
					}
				}

				let { position } = tetromino
				pos.set(position.x * cell, position.y * cell)
			},
		)

		this.queries.tetrominos.changed.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let { graphics } = e.getComponent(Sprite)
				let { direction, tetrimino } = e.getComponent(Tetromino)
				let shape = tetrimino.shape.get(direction)
				graphics.children.forEach((c, i) =>
					c.position.set(shape[i].x * cell, shape[i].y * cell),
				)
			},
		)
	}
}

export default TetrisSystem
