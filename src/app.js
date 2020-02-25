import { Graphics } from "pixi"
import { world, app } from "./globals.js"

import Position from "./components/position.js"
import Sprite from "./components/sprite.js"

import CollisionSystem from "./systems/collisions.js"
import MovementSystem from "./systems/movement.js"
import RenderableSystem from "./systems/renderable.js"
import TickerSystem from "./systems/ticker.js"

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
		let g = new Graphics()
			.beginFill(0xff0000)
			.lineStyle(1, 0xffffff)
			.drawCircle(0, 0, 10)
		const e = world
			.createEntity()
			.addComponent(Position, { x: innerWidth / 2, y: innerHeight / 2 })
			.addComponent(Sprite, { graphics: g })

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
