import { Component } from "ecsy"
import { Tetrimino, Direction } from "../tetris.js"
import Position from "./position.js"

class Tetromino extends Component {
	tetrimino = Tetrimino.O
	direction = Direction.North
	position = new Position(4, 19)

	reset() {
		this.tetrimino = Tetrimino.O
		this.direction = Direction.North
		this.position.set(4, 19)
	}
}

export default Tetromino
