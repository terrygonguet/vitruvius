import { System } from "ecsy"
import SAT from "sat"

import Position from "../components/position.js"
import Hitbox from "../components/hitbox.js"
import EventTarget from "../components/eventTarget.js"

/**
 * @typedef {Object} CollidionDetail
 * @property {ecsy.Entity} entity
 * @property {ecsy.Entity} other
 * @property {ecsy.Entity} a
 * @property {ecsy.Entity} b
 * @property {SAT.Response} response
 */

/**
 * @typedef {CustomEvent<CollidionDetail>} CollisionEvent
 */

class CollisionSystem extends System {
	static queries = {
		collidables: {
			components: [Position, Hitbox],
		},
	}

	init() {}

	execute(delta, time) {
		/** @type {ecsy.Entity[]} */
		let collidables = this.queries.collidables.results
		/** @type {Map<string, { a: ecsy.Entity, b: ecsy.Entity }>} */
		let pairs = new Map(),
			key
		for (const a of collidables) {
			for (const b of collidables) {
				if (a == b) continue
				key = a.id < b.id ? `${a.id}_${b.id}` : `${b.id}_${a.id}`
				if (!pairs.has(key)) pairs.set(key, { a, b })
			}
		}

		let res = new SAT.Response()
		pairs.forEach(({ a, b }) => {
			let evta = a.getComponent(EventTarget)
			let evtb = b.getComponent(EventTarget)
			if (!evta && !evtb) return // if neither can emit events this is useless

			let { value: hba, group: groupa } = a.getComponent(Hitbox)
			let { value: hbb, group: groupb } = b.getComponent(Hitbox)
			if (groupa == groupb) return // entities from the same group don't collide

			let posa = a.getComponent(Position)
			let posb = b.getComponent(Position)
			hba.pos.copy(posa)
			hbb.pos.copy(posb)
			res.clear()

			let method = `test${hba.r ? "Circle" : "Polygon"}${
				hbb.r ? "Circle" : "Polygon"
			}`
			if (SAT[method](hba, hbb, res)) {
				evta?.dispatchEvent(
					new CustomEvent("collide", {
						detail: { entity: a, other: b, a, b, response: res },
					}),
				)
				evtb?.dispatchEvent(
					new CustomEvent("collide", {
						detail: { entity: b, other: a, a, b, response: res },
					}),
				)
			}
		})
	}
}

export default CollisionSystem
