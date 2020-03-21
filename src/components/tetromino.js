import { Component } from "ecsy"
import { Tetrimino, Direction } from "../tetris.js"
import Position from "./position.js"

class Tetromino extends Component {
	tetrimino = Tetrimino.O
	direction = Direction.North
	position = new Position(4, 20)
	placementMode = false
	movesLeft = 15
	lockdownTimer = 0

	reset() {
		this.tetrimino = Tetrimino.O
		this.direction = Direction.North
		this.position.set(4, 20)
		this.placementMode = false
		this.movesLeft = 15
		this.lockdownTimer = 0
	}
}

export default Tetromino
