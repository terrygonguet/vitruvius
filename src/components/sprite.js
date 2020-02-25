import { Component } from "ecsy"

class Sprite extends Component {
	graphics = null
	parent = null

	reset() {
		this.graphics = this.parent = null
	}
}

export default Sprite
