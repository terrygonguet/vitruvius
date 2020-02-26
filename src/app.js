import { world, app } from "./globals.js"

import CollisionSystem from "./systems/collisions.js"
import MovementSystem from "./systems/movement.js"
import RenderableSystem from "./systems/renderable.js"
import EventSystem from "./systems/events.js"
import TetrisSystem from "./systems/tetris.js"

import makeBoard from "./prefabs/board.js"

world
	.registerSystem(EventSystem)
	.registerSystem(TetrisSystem)
	.registerSystem(MovementSystem)
	.registerSystem(CollisionSystem)
	.registerSystem(RenderableSystem)

app.loader
	.on("error", (err, loader, res) => {
		console.error(err, loader, res)
	})
	.on("complete", () => {
		window.tetrisBoard = makeBoard("left")
		makeBoard("right")
		let prev = performance.now(),
			now,
			delta
		requestAnimationFrame(function raf(time) {
			now = performance.now()
			delta = now - prev
			world.execute(delta / 1000, time)
			prev = now
			requestAnimationFrame(raf)
		})

		console.log(world, app)
	})
	.load()
