import { SystemStateComponent } from "ecsy"

class DisplayObject extends SystemStateComponent {
	/** @type {PIXI.Container} */
	graphics = null
	/** @type {PIXI.Container} */
	parent = null
	reset() {
		this.graphics = null
		this.parent = null
	}
}

export default DisplayObject
