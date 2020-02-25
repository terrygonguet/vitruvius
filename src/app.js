import { world, app, tetriminos, directions } from "./globals.js"

import Position from "./components/position.js"
import Sprite from "./components/sprite.js"

import CollisionSystem from "./systems/collisions.js"
import MovementSystem from "./systems/movement.js"
import RenderableSystem from "./systems/renderable.js"
import TickerSystem from "./systems/ticker.js"
import makeBoard from "./prefabs/board.js"
import makeTetrimino from "./prefabs/tetrimino.js"

world
	.registerSystem(TickerSystem)
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

let curTetrimino = 0,
	curDirection = 0,
	e
document.addEventListener("click", () => {
	if (e) e.remove()
	e = makeTetrimino(tetriminos[curTetrimino], directions[curDirection])
	curDirection++
	if (curDirection >= directions.length) {
		curDirection = 0
		curTetrimino++
	}
	if (curTetrimino >= tetriminos.length) curTetrimino = 0
})
