import { System } from "ecsy"
import Tetromino from "../components/tetromino.js"
import Sprite from "../components/sprite.js"
import Position from "../components/position.js"
import { TetrisBoard } from "../components/tags.js"
import { getBoardDimensions, range } from "../tools.js"
import {
	queryTetromino,
	Tetrimino,
	moveTetromino,
	rotateTetromino,
	matrix,
	width,
	Color,
	NextQueue,
	bufferHeight,
	queryLine,
	Direction,
} from "../tetris.js"
import makeTetromino from "../prefabs/tetromino.js"
import { world } from "../globals.js"
import { Graphics } from "pixi.js"

let { cell } = getBoardDimensions()

class TetrisSystem extends System {
	static queries = {
		tetrominos: {
			components: [Tetromino],
			listen: { changed: true },
		},
	}

	init() {
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
		this.heldEntity = world.createEntity()
		this.ghost = world.createEntity()

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
		let graphics = new Graphics()
		this.heldEntity
			.addComponent(Sprite, { graphics })
			.addComponent(Position, {
				x: innerWidth / 2 - cell,
				y: innerHeight / 4,
			})
		this.drawHeld()

		// HACK
		setTimeout(() => {
			/** @type {ecsy.Entity} */
			let board = window.tetrisBoard
			let { graphics: parent } = board.getComponent(Sprite)
			graphics = new Graphics()
			this.ghost
				.addComponent(Sprite, { graphics, parent })
				.addComponent(Position)
		}, 150)
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
				let isTouching = !moveTetromino(tetromino, { x: 0, y: -1 })
				let hasMoved = false

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
					this.drawHeld()
					this.drawGhost(next.getComponent(Tetromino))
					this.time = 0
					return
				}

				if (this.keys.rotateCW) {
					if (tetromino.placementMode && tetromino.movesLeft <= 0)
						return
					let next = rotateTetromino(tetromino, "clockwise")
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
					let next = rotateTetromino(tetromino, "counterClockwise")
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
						let next = moveTetromino(tetromino, { x: deltaX, y: 0 })
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
					let next = moveTetromino(tetromino, { x: 0, y: -1 })
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
		/** @type {ecsy.Entity} */
		let board = window.tetrisBoard
		let { graphics: boardGraphics } = board.getComponent(Sprite)
		let shape = tetrimino.shape
			.get(direction)
			.map(p => p.clone().add(position))
		shape.forEach(p => {
			let mino = world.createEntity()
			matrix[p.y * width + p.x] = mino
			let g = new Graphics()
			g.beginFill(tetrimino.color.hex).drawRect(0, 0, cell, cell)
			mino.addComponent(Sprite, {
				graphics: g,
				parent: boardGraphics,
			}).addComponent(Position, p.scale(cell))
		})
		e.remove()
		this.spawnTimer = 0.2
		this.canHold = true

		this.clearLines()
	}

	clearLines() {
		for (let y = 0; y < bufferHeight; y++) {
			let query = queryLine(y).filter(e => e && e.id)
			if (query.length != 10) continue
			for (const i of range(0, width - 1)) {
				for (const j of range(y + 1, bufferHeight - 1)) {
					let e = matrix[j * width + i]
					matrix[(j - 1) * width + i] = e
					if (!e) continue
					let position = e.getMutableComponent(Position)
					position.y -= cell
				}
			}
			query.forEach(e => e.remove())
			y-- // the rows moved down
		}
	}

	drawHeld() {
		/** @type {{ graphics: PIXI.Graphics }} */
		let { graphics } = this.heldEntity.getMutableComponent(Sprite)
		const shape = this.held.shape.get(Direction.North)
		graphics
			.clear()
			.beginFill(this.held.color.hex)
			.scale.set(1, -1)
		for (const p of shape) {
			graphics.drawRect(p.x * cell, p.y * cell, cell, cell)
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
		while (moveTetromino(tetromino, { x: 0, y: -i })) i++
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
