import { Component } from "ecsy"

class Sprite extends Component {
	/** @type {PIXI.Container} */
	graphics = null
	/** @type {PIXI.Container} */
	parent = null

	reset() {
		this.graphics = this.parent = null
	}
}

export default Sprite
