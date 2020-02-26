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
	NextQueue,
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
		this.spawnTimer = 0.5
		this.keys = {
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

		document.addEventListener("keydown", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = true
		})
		document.addEventListener("keyup", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = false
		})
		this.queue = new NextQueue()
		this.held = this.queue.next()
		this.canHold = true
	}

	execute(delta, time) {
		this.time += delta
		let tetroQuery = this.queries.tetrominos
		let dropNow =
			this.time >= this.fallSpeed / (this.keys.softDrop ? 20 : 1)
		let { cell } = getBoardDimensions()

		if (this.spawnTimer > 0) {
			this.spawnTimer -= delta
			if (this.spawnTimer <= 0) makeTetromino(this.queue.next())
		}

		tetroQuery.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let pos = e.getMutableComponent(Position)
				let tetromino = e.getComponent(Tetromino)
				let isTouching = !moveTetromino(tetromino, { x: 0, y: -1 })
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
					}
					this.keys.rotateCCW = false
				}
				let deltaX = this.keys.moveRight - this.keys.moveLeft
				if (deltaX) {
					if (!tetromino.placementMode || tetromino.movesLeft > 0) {
						let next = moveTetromino(tetromino, { x: deltaX, y: 0 })
						if (next) {
							tetromino.movesLeft--
							tetromino.lockdownTimer = 0.5
							tetromino.position.copy(next.position)
						}
					}
					this.keys.moveLeft = this.keys.moveRight = false
				}
				if (dropNow && !isTouching) {
					let next = moveTetromino(tetromino, { x: 0, y: -1 })
					if (next) tetromino.position.copy(next.position)
					else this.lockDown(e) // should not happen here
					this.time = 0
				}

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
	}

	/**
	 * Performs a lock down
	 * @param {ecsy.Entity} e
	 */
	lockDown(e) {
		let { cell } = getBoardDimensions()
		let { position, direction, tetrimino } = e.getComponent(Tetromino)
		/** @type {ecsy.Entity} */
		let board = this.queries.board.results[0]
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
		// remove the logic first and the graphics a bit later to prevent flickering
		e.removeComponent(Tetromino)
		setTimeout(() => e.remove(), 50)
		this.spawnTimer = 0.2
		this.canHold = true
	}
}

export default TetrisSystem
