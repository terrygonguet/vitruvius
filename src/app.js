import { world, app } from "./globals.js"

import CollisionSystem from "./systems/collisions.js"
import MovementSystem from "./systems/movement.js"
import RenderableSystem from "./systems/renderable.js"
import EventSystem from "./systems/events.js"
import TetrisSystem from "./systems/tetris.js"

import makeBoard from "./prefabs/board.js"
import { matrix } from "./tetris.js"

app.loader
	.on("error", (err, loader, res) => {
		console.error(err, loader, res)
	})
	.on("complete", () => {
		window.tetrisBoard = makeBoard("left")
		window.brakoutBoard = makeBoard("right")

		world
			.registerSystem(EventSystem)
			.registerSystem(TetrisSystem)
			.registerSystem(MovementSystem)
			.registerSystem(CollisionSystem)
			.registerSystem(RenderableSystem)

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

		console.log(world, app, matrix)
	})
	.load()

document.addEventListener("keydown", e => {
	if (e.key == "Escape" || e.key == "F1") {
		world.enabled = !world.enabled
	}
})
