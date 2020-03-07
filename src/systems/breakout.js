import { System } from "ecsy"
import { Graphics } from "pixi.js"
import SAT from "sat"
import Hitbox, { Group } from "../components/hitbox.js"
import Position from "../components/position.js"
import Sprite from "../components/sprite.js"
import { Ball } from "../components/tags.js"
import Velocity from "../components/velocity.js"
import { world } from "../globals.js"
import { clamp, getBoardDimensions } from "../tools.js"
import EventTarget from "../components/eventTarget.js"

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

		document.addEventListener("keydown", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = true
		})
		document.addEventListener("keyup", e => {
			let key = this.keybinds[e.key]
			if (key) this.keys[key] = false
		})
		/** @type {ecsy.Entity} */
		let board = this.breakoutBoard
		let { graphics: parent } = board.getComponent(Sprite)
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

		const hwall = new SAT.Box(new Position(), boardWidth, 10)
		const vwall = new SAT.Box(new Position(), 10, boardHeight)
		this.walls[0]
			.addComponent(Position, { x: -10, y: 0 })
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
			.addComponent(Position)
			.addComponent(Hitbox, {
				value: hwall.toPolygon(),
				group: Group.horizontalWall,
			})
			.addComponent(EventTarget)
		this.walls[3]
			.addComponent(Position, { y: boardHeight, x: 0 })
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
	 * Creates a ball above the given paddle position with
	 * an angle if `deltaX != 0`
	 * @param {Object} options
	 * @param {Position} options.position
	 * @param {number} options.deltaX
	 */
	createBall({ position, deltaX } = {}) {
		const ball = world.createEntity()
		/** @type {ecsy.Entity} */
		const board = this.breakoutBoard
		const { graphics: parent } = board.getComponent(Sprite)
		const graphics = new Graphics()
		const angle = (-Math.PI / 4) * Math.sign(deltaX)
		const ballPos = position.clone().add({ x: 0, y: cell })
		const hitbox = new SAT.Circle(ballPos.clone(), cell / 3)
		graphics
			.beginFill(0xff0000)
			.lineStyle(1, 0xffffff)
			.drawCircle(0, 0, cell / 3)
		ball.addComponent(Position, ballPos)
		ball.addComponent(Sprite, { graphics, parent })
		ball.addComponent(Velocity, new Velocity(0, 500).rotate(angle))
		ball.addComponent(Ball)
		ball.addComponent(Hitbox, { value: hitbox, group: Group.ball })
		ball.addComponent(EventTarget)

		let evt = ball.getComponent(EventTarget)

		evt.addEventListener(
			"collide",
			/** @param {CollisionEvent} e */
			e => {
				let { other, response, a } = e.detail
				let { group } = other.getComponent(Hitbox)
				let toMove = false
				if ([Group.horizontalWall, Group.paddle].includes(group)) {
					ball?.getMutableComponent(Velocity)?.scale(1, -1)
					toMove = true
				} else if (group == Group.verticalWall) {
					ball?.getMutableComponent(Velocity)?.scale(-1, 1)
					toMove = true
				}
				if (toMove) {
					let pos = ball?.getMutableComponent(Position)
					if (ball == a) pos?.sub(response.overlapV)
					else pos?.add(response.overlapV)
				}
			},
		)
	}
}

export default BreakoutSystem
