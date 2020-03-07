import { System } from "ecsy"
import EventTarget from "../components/eventTarget.js"

class EventSystem extends System {
	static queries = {
		eventEmitters: {
			components: [EventTarget],
			listen: {
				added: true,
				removed: true,
			},
		},
	}

	init() {}

	execute(delta, time) {
		this.queries.eventEmitters.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let evtg = e.getComponent(EventTarget)
				evtg?.dispatchEvent(
					new CustomEvent("tick", {
						detail: { entity: e, delta, time },
					}),
				)
			},
		)
		this.queries.eventEmitters.added.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let evtg = e.getComponent(EventTarget)
				evtg?.dispatchEvent(
					new CustomEvent("added", {
						detail: { entity: e },
					}),
				)
			},
		)
		this.queries.eventEmitters.removed.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let evtg = e.getRemovedComponent(EventTarget)
				evtg?.dispatchEvent(
					new CustomEvent("removed", {
						detail: { entity: e },
					}),
				)
			},
		)
	}
}

export default EventSystem
