import { app, world } from "./globals.js"
import makeBoard from "./prefabs/board.js"
import BreakoutSystem from "./systems/breakout.js"
import CollisionSystem from "./systems/collisions.js"
import EventSystem from "./systems/events.js"
import MovementSystem from "./systems/movement.js"
import RenderableSystem from "./systems/renderable.js"
import TetrisSystem from "./systems/tetris.js"
import { matrix } from "./tetris.js"

app.loader
	.on("error", (err, loader, res) => {
		console.error(err, loader, res)
	})
	.on("complete", () => {
		window.tetrisBoard = makeBoard("left")
		window.breakoutBoard = makeBoard("right")

		world
			.registerSystem(EventSystem)
			.registerSystem(TetrisSystem)
			.registerSystem(BreakoutSystem)
			.registerSystem(MovementSystem)
			.registerSystem(CollisionSystem)
			.registerSystem(RenderableSystem)

		let prev = performance.now(),
			now,
			delta
		requestAnimationFrame(function raf(time) {
			now = performance.now()
			delta = now - prev
			prev = now
			if (world.enabled) {
				world.execute(delta / 1000, time)
				app.render()
			}
			requestAnimationFrame(raf)
		})

		console.log(world, app, matrix)
	})
	.load()

document.addEventListener("keydown", e => {
	if (e.key == "Escape" || e.key == "F1") {
		world.enabled = !world.enabled
	} else if (e.key == "Enter") {
		world.execute()
	}
})
