import { Component } from "ecsy"

class Hitbox extends Component {
	/** @type {SAT.Polygon|SAT.Circle} */
	value = null
	group = Group.none

	clear() {
		this.value = null
		this.group = Group.none
	}
}

export class Group {
	static none = new Group("none")
	static mino = new Group("mino")
	static tetromino = new Group("tetromino")
	static paddle = new Group("paddle")
	static ball = new Group("ball")
	static verticalWall = new Group("verticalWall")
	static horizontalWall = new Group("horizontalWall")

	constructor(label) {
		this.label = label
	}

	toString() {
		return `Group(${this.label})`
	}
}

export default Hitbox
