import { World } from "ecsy"
import { Application } from "pixi.js"
import makeBreakoutBoard from "./prefabs/breakoutBoard.js"
import makeTetrisBoard from "./prefabs/tetrisBoard.js"
import BreakoutSystem from "./systems/breakout.js"
import CollisionSystem from "./systems/collisions.js"
import EventSystem from "./systems/events.js"
import MovementSystem from "./systems/movement.js"
import RenderableSystem from "./systems/renderable.js"
import TetrisSystem from "./systems/tetris.js"

export const canvas = document.querySelector("#canvas")

export const app = new Application({
	view: canvas,
	resizeTo: window,
	autoDensity: true,
	autoStart: false,
})

export const stage = app.stage

export const ticker = app.ticker

export const world = new World()

export const bus = new EventTarget()

export function start() {
	world.entityManager.removeAllEntities()
	// HACK: run one tick to clear resources
	world.enabled = true
	world.execute(Number.MIN_VALUE)
	stage.removeChildren()

	window.tetrisBoard = makeTetrisBoard()
	window.breakoutBoard = makeBreakoutBoard()

	// HACK
	world.systemManager = new world.systemManager.constructor(world)
	world
		.registerSystem(TetrisSystem)
		.registerSystem(BreakoutSystem)
		.registerSystem(MovementSystem)
		.registerSystem(CollisionSystem)
		.registerSystem(RenderableSystem)
		.registerSystem(EventSystem)

	let prev = performance.now(),
		now,
		delta
	window.rafID =
		window.rafID ||
		requestAnimationFrame(function raf(time) {
			now = performance.now()
			delta = now - prev
			prev = now
			if (world.enabled) {
				world.execute(delta / 1000, time)
				app.render()
			}
			window.rafID = requestAnimationFrame(raf)
		})

	console.log(world, app)
}
