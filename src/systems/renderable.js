import { System, Not } from "ecsy"

import Position from "../components/position.js"
import Sprite from "../components/sprite.js"
import { stage } from "../globals.js"
import DisplayObject from "../components/displayObject.js"

class RenderableSystem extends System {
	static queries = {
		renderables: { components: [Position, DisplayObject] },
		spriteAdded: { components: [Sprite, Not(DisplayObject), Position] },
		spriteRemoved: { components: [Not(Sprite), DisplayObject] },
	}

	init() {}

	execute(delta, time) {
		this.queries.renderables.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let pos = e.getComponent(Position)
				let { graphics } = e.getComponent(DisplayObject)
				graphics.position.set(pos.x, pos.y)
			},
		)

		this.queries.spriteAdded.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let pos = e.getComponent(Position)
				let { graphics, parent } = e.getComponent(Sprite)
				e.addComponent(DisplayObject, { graphics, parent })
				graphics.position.set(pos.x, pos.y)
				;(parent || stage).addChild(graphics)
			},
		)

		this.queries.spriteRemoved.results.forEach(
			/** @param {ecsy.Entity} e */
			e => {
				let { graphics, parent } =
					e.getComponent(DisplayObject) ||
					e.getRemovedComponent(DisplayObject)
				if (parent) parent.removeChild(graphics)
				else graphics.destroy({ children: true })
				e.removeComponent(DisplayObject)
			},
		)
	}
}

export default RenderableSystem
