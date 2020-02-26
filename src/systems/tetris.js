import { System } from "ecsy"
import Tetromino from "../components/tetromino.js"
import Sprite from "../components/sprite.js"
import Position from "../components/position.js"
import { TetrisBoard } from "../components/tags.js"
import { getBoardDimensions } from "../tools.js"
import { queryTetromino } from "../tetris.js"

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
	}

	execute(delta, time) {
		this.time += delta
		let dropNow = this.time >= this.fallSpeed
		if (dropNow) this.time = 0
		/** @type {ecsy.Entity} */
		let board = this.queries.board.results[0]
		let { width: w, height: h, cell } = getBoardDimensions()

		this.queries.tetrominos.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let pos = e.getMutableComponent(Position)
				let { position, tetrimino, direction } = e.getComponent(
					Tetromino,
				)
				if (dropNow) {
					let nextPos = position.clone()
					nextPos.y--
					if (
						queryTetromino({
							direction,
							tetrimino,
							position: nextPos,
						}).filter(Boolean).length == 0
					) {
						position.copy(nextPos)
					}
				}
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
