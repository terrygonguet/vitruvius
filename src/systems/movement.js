import { System } from "ecsy"
import Position from "../components/position.js"
import Velocity from "../components/velocity.js"

class MovementSystem extends System {
	static queries = {
		movables: {
			components: [Position, Velocity],
		},
	}

	execute(delta, time) {
		this.queries.movables.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let pos = e.getMutableComponent(Position)
				let vel = e.getComponent(Velocity)
				pos.scaleAndAdd(vel, delta)
			},
		)
	}
}

export default MovementSystem
