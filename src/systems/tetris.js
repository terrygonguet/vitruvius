import { System } from "ecsy"
import Tetromino from "../components/tetromino.js"
import Sprite from "../components/sprite.js"
import Position from "../components/position.js"
import { getBoardDimensions, range } from "../tools.js"
import { matrix, width, NextQueue, bufferHeight, Direction } from "../tetris.js"
import makeTetromino from "../prefabs/tetromino.js"
import { world, bus } from "../globals.js"
import { Graphics } from "pixi.js"
import MinoManager from "../utils/minoManager.js"
import Data from "../components/data.js"

let { cell, width: boardWidth } = getBoardDimensions()

class TetrisSystem extends System {
	static queries = {
		tetrominos: {
			components: [Tetromino],
			listen: { changed: true },
		},
	}

	init() {
		/** @type {ecsy.Entity} */
		this.tetrisBoard = window.tetrisBoard
		this.fallSpeed = 1
		this.time = 0
		this.spawnTimer = 0.5
		this.queue = new NextQueue()
		this.held = this.queue.next()
		this.canHold = true
		this.autorepeat = Infinity
		this.keys = {
			rotateCW: false,
			rotateCCW: false,
			softDrop: false,
			hardDrop: false,
			moveRight: false,
			moveLeft: false,
			hold: false,
		}
		this.keysPressed = {
			rotateCW: false,
			rotateCCW: false,
			softDrop: false,
			hardDrop: false,
			moveRight: false,
			moveLeft: false,
			hold: false,
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
		}
		this.ghost = world.createEntity("Ghost Tetromino")
		this.minoManager = new MinoManager()

		document.addEventListener("keydown", e => {
			let key = this.keybinds[e.key]
			if (key) {
				this.keys[key] = true
				this.keysPressed[key] = true
			}
			if (key == "moveRight" || key == "moveLeft") this.autorepeat = 0.3
		})
		document.addEventListener("keyup", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = false
			if (key == "moveRight" || key == "moveLeft") {
				if (this.keys.moveLeft + this.keys.moveRight)
					this.autorepeat = 0.3
				else this.autorepeat = Infinity
			}
		})

		let { graphics: ghostParent } = this.tetrisBoard.getComponent(Sprite)
		let graphics = new Graphics()
		this.ghost
			.addComponent(Sprite, { graphics, parent: ghostParent })
			.addComponent(Position)
		matrix.init()
		this.minoManager.init()
	}

	execute(delta, time) {
		this.time += delta
		this.autorepeat -= delta
		let tetroQuery = this.queries.tetrominos
		let dropNow =
			this.time >= this.fallSpeed / (this.keys.softDrop ? 20 : 1)

		if (this.spawnTimer > 0) {
			this.spawnTimer -= delta
			if (this.spawnTimer <= 0) {
				let next = makeTetromino(this.queue.next())
				this.drawGhost(next.getComponent(Tetromino))
			}
		}

		tetroQuery.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let pos = e.getMutableComponent(Position)
				let tetromino = e.getComponent(Tetromino)
				let isTouching = !matrix.moveTetromino(tetromino, {
					x: 0,
					y: -1,
				})
				let hasMoved = false

				if (this.keysPressed.hardDrop) {
					while (matrix.moveTetromino(tetromino, { x: 0, y: -1 }))
						tetromino.position.y--
				}

				if (isTouching && !tetromino.placementMode) {
					tetromino.placementMode = true
					tetromino.movesLeft = 15
					tetromino.lockdownTimer = 0.5
				}

				if (tetromino.placementMode) {
					if (tetromino.lockdownTimer <= 0 && isTouching)
						return this.lockDown(e)
					tetromino.lockdownTimer -= delta
				}

				if (this.keys.hold && this.canHold) {
					this.canHold = false
					e.remove()
					let next = makeTetromino(this.held)
					this.held = tetromino.tetrimino
					this.drawGhost(next.getComponent(Tetromino))
					this.time = 0
					bus.dispatchEvent(
						new CustomEvent("tetrisheldchange", {
							detail: { held: this.held },
						}),
					)
					return
				}

				if (this.keys.rotateCW) {
					if (tetromino.placementMode && tetromino.movesLeft <= 0)
						return
					let next = matrix.rotateTetromino(tetromino, "clockwise")
					if (next) {
						tetromino.movesLeft--
						tetromino.lockdownTimer = 0.5
						Object.assign(e.getMutableComponent(Tetromino), next)
						if (tetromino.position.y < next.position.y)
							this.time = 0
						hasMoved = true
					}
					this.keys.rotateCW = false
				}
				if (this.keys.rotateCCW) {
					if (tetromino.placementMode && tetromino.movesLeft <= 0)
						return
					let next = matrix.rotateTetromino(
						tetromino,
						"counterClockwise",
					)
					if (next) {
						tetromino.movesLeft--
						tetromino.lockdownTimer = 0.5
						Object.assign(e.getMutableComponent(Tetromino), next)
						if (tetromino.position.y < next.position.y)
							this.time = 0
						hasMoved = true
					}
					this.keys.rotateCCW = false
				}
				let deltaX = this.keys.moveRight - this.keys.moveLeft,
					justPressedMove =
						this.keysPressed.moveLeft || this.keysPressed.moveRight
				if (deltaX && (this.autorepeat <= 0 || justPressedMove)) {
					if (!tetromino.placementMode || tetromino.movesLeft > 0) {
						let next = matrix.moveTetromino(tetromino, {
							x: deltaX,
							y: 0,
						})
						if (next) {
							tetromino.movesLeft--
							tetromino.lockdownTimer = 0.5
							tetromino.position.copy(next.position)
							hasMoved = true
						}
					}
					this.keys.moveLeft = this.keys.moveRight = false
				}
				if (dropNow && !isTouching) {
					let next = matrix.moveTetromino(tetromino, { x: 0, y: -1 })
					if (next) tetromino.position.copy(next.position)
					else this.lockDown(e) // should not happen here
					this.time = 0
					hasMoved = true
				}

				if (hasMoved) this.drawGhost(tetromino)

				let { position } = tetromino
				pos.set(position.x * cell, position.y * cell)
			},
		)

		tetroQuery.changed.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let { graphics } = e.getComponent(Sprite)
				let { direction, tetrimino } =
					e.getComponent(Tetromino) ||
					e.getRemovedComponent(Tetromino)
				let shape = tetrimino.shape.get(direction)
				graphics.children.forEach((c, i) =>
					c.position.set(shape[i].x * cell, shape[i].y * cell),
				)

				/** @type {ecsy.Entity} */
				let ghost = e.getComponent(Data).get("ghost")
				let { graphics: ghostGraphics } = ghost.getComponent(Sprite)
				ghostGraphics.children.forEach((c, i) =>
					c.position.set(shape[i].x * cell, shape[i].y * cell),
				)
			},
		)

		Object.keys(this.keysPressed).forEach(
			k => (this.keysPressed[k] = false),
		)
	}

	/**
	 * Performs a lock down
	 * @param {ecsy.Entity} e
	 */
	lockDown(e) {
		let { position, direction, tetrimino } = e.getComponent(Tetromino)
		let shape = tetrimino.shape
			.get(direction)
			.map(p => p.clone().add(position))
		matrix.setMultiple(shape, tetrimino.color)
		e.remove()
		this.spawnTimer = 0.2
		this.canHold = true

		this.clearLines()
	}

	clearLines() {
		for (let y = 0; y < bufferHeight; y++) {
			let query = matrix.queryLine(y).filter(Boolean)
			if (query.length != 10) continue
			// drop all blocks above by one line
			let temps = Array.from(range(0, width - 1)).map(
				x => new Position(x, 0),
			)
			for (const j of range(y + 1, bufferHeight - 1)) {
				let rowAbove = matrix.queryLine(j)
				temps.forEach(p => (p.y = j - 1))
				matrix.setMultiple(temps, rowAbove)
			}
			y-- // the rows moved down
		}
	}

	/**
	 * @param {Tetromino} tetromino
	 */
	drawGhost(tetromino) {
		/** @type {{ graphics: PIXI.Graphics }} */
		let { graphics } = this.ghost.getMutableComponent(Sprite)
		let pos = this.ghost.getMutableComponent(Position)
		let { direction, position, tetrimino } = tetromino
		let i = 1
		graphics.clear().beginFill(tetrimino.color.hex, 0.4)
		while (matrix.moveTetromino(tetromino, { x: 0, y: -i })) i++
		if (i == 1) return
		const y = position.y - (i - 1)
		const shape = tetrimino.shape.get(direction)
		for (const p of shape) {
			graphics.drawRect(p.x * cell, p.y * cell, cell, cell)
		}
		pos.set(position.x * cell, y * cell)
	}
}

export default TetrisSystem
