import { System } from "ecsy"
import { Graphics } from "pixi.js"
import SAT from "sat"
import Data from "../components/data.js"
import EventTarget from "../components/eventTarget.js"
import Hitbox, { Group } from "../components/hitbox.js"
import Position from "../components/position.js"
import Sprite from "../components/sprite.js"
import { Ball } from "../components/tags.js"
import Velocity from "../components/velocity.js"
import { world } from "../globals.js"
import { clamp, getBoardDimensions } from "../tools.js"
import TetrisSystem from "./tetris.js"

/**
 * @typedef {import("./collisions.js").CollisionEvent} CollisionEvent
 */

let { cell, width: boardWidth, height: boardHeight } = getBoardDimensions()

class BreakoutSystem extends System {
	static queries = {
		balls: {
			components: [Ball],
		},
	}

	init() {
		this.paddle = world.createEntity()
		/** @type {ecsy.Entity} */
		this.breakoutBoard = window.breakoutBoard
		this.moveSpeed = 400
		this.keys = {
			moveRight: false,
			moveLeft: false,
			action: false,
		}
		this.keybinds = {
			a: "moveRight",
			d: "moveLeft",
			s: "action",
		}
		this.walls = new Array(4).fill(0).map(_ => world.createEntity())
		this.ballSpeed = 300
		this.ballRadius = cell / 5

		document.addEventListener("keydown", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = true
		})
		document.addEventListener("keyup", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = false
		})
		let { graphics: parent } = this.breakoutBoard.getComponent(Sprite)
		let graphics = new Graphics()
		graphics.beginFill(0xffffff).drawRoundedRect(-50, -10, 100, 20, 12)
		let hitbox = new SAT.Polygon(new Position(boardWidth / 2, cell), [
			new Position(-50, -10),
			new Position(50, -10),
			new Position(50, 10),
			new Position(-50, 10),
		])
		this.paddle.addComponent(Sprite, { graphics, parent })
		this.paddle.addComponent(Position, { x: boardWidth / 2, y: cell })
		this.paddle.addComponent(Hitbox, { value: hitbox, group: Group.paddle })

		const hwall = new SAT.Box(new Position(), boardWidth, cell)
		const vwall = new SAT.Box(new Position(), cell, 2 * boardHeight)
		this.walls[0]
			.addComponent(Position, { x: -cell, y: 0 })
			.addComponent(Hitbox, {
				value: vwall.toPolygon(),
				group: Group.verticalWall,
			})
		this.walls[1]
			.addComponent(Position, { x: boardWidth, y: 0 })
			.addComponent(Hitbox, {
				value: vwall.toPolygon(),
				group: Group.verticalWall,
			})
		this.walls[2]
			.addComponent(Position, { x: 0, y: -cell })
			.addComponent(Hitbox, {
				value: hwall.toPolygon(),
				group: Group.horizontalWall,
			})
			.addComponent(EventTarget)
		this.walls[3]
			.addComponent(Position, { y: 2 * boardHeight, x: 0 })
			.addComponent(Hitbox, {
				value: hwall.toPolygon(),
				group: Group.horizontalWall,
			})
		this.walls[2].getComponent(EventTarget).addEventListener(
			"collide",
			/** @param {CollisionEvent} e */
			e => {
				let { other } = e.detail
				let { group } = other.getComponent(Hitbox)
				if (group == Group.ball) other.remove()
			},
		)
	}

	execute(delta, time) {
		const position = this.paddle.getMutableComponent(Position)
		const deltaX =
			(this.keys.moveLeft - this.keys.moveRight) * this.moveSpeed * delta
		position.x = clamp(position.x + deltaX, 50, boardWidth - 50)

		const ballExists = !!this.queries.balls.results.length
		if (!ballExists && this.keys.action) {
			this.createBall({ position, deltaX })
		}
	}

	/**
	 * Creates a ball above the given position position with
	 * an angle if `deltaX != 0`
	 * @param {Object} options
	 * @param {Position} options.position
	 * @param {number} options.deltaX
	 */
	createBall({ position, deltaX } = {}) {
		const ball = world.createEntity()
		const { graphics: parent } = this.breakoutBoard.getComponent(Sprite)
		const { graphics: ghostParent } = window.tetrisBoard.getComponent(
			Sprite,
		)
		const graphics = new Graphics()
		const angle = (-Math.PI / 5) * Math.sign(deltaX)
		const ballPos = position.clone().add({ x: 0, y: cell })
		const hitbox = new SAT.Circle(ballPos.clone(), this.ballRadius)
		graphics
			.beginFill(0xff0000)
			.lineStyle(1, 0xffffff)
			.drawCircle(0, 0, this.ballRadius)
		const ghost = world.createEntity()
		ball.addComponent(Position, ballPos)
		ghost.addComponent(Position, ballPos.clone())
		ball.addComponent(Sprite, { graphics, parent })
		ghost.addComponent(Sprite, {
			graphics: graphics.clone(),
			parent: ghostParent,
		})
		ball.addComponent(
			Velocity,
			new Velocity(0, this.ballSpeed).rotate(angle),
		)
		ball.addComponent(Ball)
		ball.addComponent(Hitbox, { value: hitbox, group: Group.ball })
		ball.addComponent(EventTarget)
		ball.addComponent(Data, {
			flip: { vertical: false, horizontal: false },
			ghost,
		})

		let evt = ball.getComponent(EventTarget)

		evt.addEventListener("tick", () => {
			let data = ball.getMutableComponent(Data)
			/** @type {ecsy.Entity} */
			let ghost = data.get("ghost")
			let pos = ball.getComponent(Position)
			let ghostPos = ghost.getComponent(Position)
			/** @type {TetrisSystem} */
			let { minoManager } = world.getSystem(TetrisSystem)
			ghostPos
				.copy(pos)
				.sub({ x: 0, y: minoManager.breakoutOffset * cell })

			let flip = data.get("flip")
			flip.horizontal = flip.vertical = false
		})

		evt.addEventListener("removed", () => {
			console.log(ball)
			/** @type {ecsy.Entity} */
			let ghost = ball.getRemovedComponent(Data).get("ghost")
			ghost.remove()
		})

		evt.addEventListener(
			"collide",
			/** @param {CollisionEvent} e */
			e => {
				let { other, response, a } = e.detail
				let { group } = other.getComponent(Hitbox)
				let flip = ball.getMutableComponent(Data).get("flip")
				if (group == Group.horizontalWall && !flip.horizontal) {
					ball?.getMutableComponent(Velocity)?.scale(1, -1)
					flip.horizontal = true
				} else if (group == Group.verticalWall && !flip.vertical) {
					ball?.getMutableComponent(Velocity)?.scale(-1, 1)
					flip.vertical = true
				} else if (group == Group.mino) {
					const { x, y } = response.overlapN
					if (Math.abs(x) > Math.abs(y) && !flip.vertical) {
						ball?.getMutableComponent(Velocity)?.scale(-1, 1)
						flip.vertical = true
					} else if (!flip.horizontal) {
						ball?.getMutableComponent(Velocity)?.scale(1, -1)
						flip.horizontal = true
					}
				} else if (group == Group.paddle) {
					const { x, y } = response.overlapN
					if (Math.abs(x) > Math.abs(y) && !flip.vertical) {
						ball?.getMutableComponent(Velocity)?.scale(-1, 1)
						flip.vertical = true
					} else if (!flip.horizontal) {
						let velocity = ball
							?.getMutableComponent(Velocity)
							.set(0, this.ballSpeed)
						let ballpos = ball.getComponent(Position)
						let paddlepos = this.paddle.getComponent(Position)
						let delta = (paddlepos.x - ballpos.x) / 50
						velocity.rotate(delta * 1.22173) // 70°
						flip.horizontal = true
					}
				}

				if (![Group.none, Group.ball].includes(group)) {
					let pos = ball?.getMutableComponent(Position)
					if (ball == a) pos?.sub(response.overlapV)
					else pos?.add(response.overlapV)
				}

				if (group == Group.mino) {
					let { x, y } = other.getComponent(Position)
					/** @type {TetrisSystem} */
					let { minoManager } = world.getSystem(TetrisSystem)
					minoManager.removeMino(
						Math.round(x / cell),
						Math.round(y / cell) - minoManager.breakoutOffset,
					)
				}
			},
		)
	}
}

export default BreakoutSystem
