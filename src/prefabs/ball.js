import { world, bus } from "../globals.js"
import Sprite from "../components/sprite.js"
import { Graphics } from "pixi.js"
import { getBoardDimensions } from "../tools.js"
import SAT from "sat"
import Position from "../components/position.js"
import Velocity from "../components/velocity.js"
import { Ball } from "../components/tags.js"
import Hitbox, { Group } from "../components/hitbox.js"
import EventTarget from "../components/eventTarget.js"
import Data from "../components/data.js"
import TetrisSystem from "../systems/tetris.js"
import { matrix, height } from "../tetris.js"

/**
 * Creates a ball above the given paddle position with
 * an angle if `deltaX != 0`
 * @param {Object} options
 * @param {ecsy.Entity} options.paddle
 * @param {number} options.deltaX
 * @param {number} options.ballRadius
 * @param {number} options.ballSpeed
 */
export default function makeBall({
	paddle,
	deltaX,
	ballRadius,
	ballSpeed,
} = {}) {
	const { cell } = getBoardDimensions()
	const ball = world.createEntity("Ball")
	const { graphics: parent } = window.breakoutBoard.getComponent(Sprite)
	const { graphics: ghostParent } = window.tetrisBoard.getComponent(Sprite)
	const graphics = new Graphics()
	const angle = (-Math.PI / 5) * Math.sign(deltaX)
	const position = paddle.getComponent(Position)
	const ballPos = position.clone().add({ x: 0, y: cell })
	const hitbox = new SAT.Circle(ballPos.clone(), ballRadius)
	graphics.beginFill(0xffff00).drawCircle(0, 0, ballRadius)
	const ghost = world.createEntity("Ghost Ball")
	ball.addComponent(Position, ballPos)
	ghost.addComponent(Position, ballPos.clone())
	ball.addComponent(Sprite, { graphics, parent })
	ghost.addComponent(Sprite, {
		graphics: graphics.clone(),
		parent: ghostParent,
	})
	ball.addComponent(Velocity, new Velocity(0, ballSpeed).rotate(angle))
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
		ghostPos.copy(pos).sub({ x: 0, y: minoManager.breakoutOffset * cell })

		let flip = data.get("flip")
		flip.horizontal = flip.vertical = false

		if (ghostPos.y > height * cell + 50)
			bus.dispatchEvent(
				new CustomEvent("gameover", { detail: "You won!" }),
			)
	})

	evt.addEventListener("removed", () => {
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
			let flip = ball?.getMutableComponent(Data)?.get("flip") || {}
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
						.set(0, ballSpeed)
					let ballpos = ball.getComponent(Position)
					let paddlepos = paddle.getComponent(Position)
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
				matrix.set(
					Math.round(x / cell),
					Math.round(y / cell) - minoManager.breakoutOffset,
				)
			}
		},
	)
}
