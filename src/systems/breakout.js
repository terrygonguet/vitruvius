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
import makeBall from "../prefabs/ball.js"
import { matrix, height } from "../tetris.js"

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
		this.paddle = world.createEntity("Paddle")
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
		this.walls = ["Left Wall", "Right Wall", "Bottom Wall", "Top Wall"].map(
			name => world.createEntity(name),
		)
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
				if (group == Group.ball) {
					other.remove()
					matrix.addJunkLine(0)
				}
			},
		)
	}

	execute(delta, time) {
		const deltaX =
			(this.keys.moveLeft - this.keys.moveRight) * this.moveSpeed * delta
		if (this.paddle.alive) {
			const position = this.paddle.getMutableComponent(Position)
			position.x = clamp(position.x + deltaX, 50, boardWidth - 50)
		}

		const ballExists = !!this.queries.balls.results.length
		if (!ballExists && this.keys.action) {
			makeBall({ ...this, deltaX })
		}
	}
}

export default BreakoutSystem
