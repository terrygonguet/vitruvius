import Position from "./components/position.js"
import { range } from "./tools.js"
import Tetromino from "./components/tetromino.js"
import { makeMino } from "./prefabs/mino.js"

export const width = 10
export const height = 20
export const bufferHeight = 40

/** @type {ecsy.Entity[]} */
export const matrix = []

export function initMatrix({
	createEntities = true,
	clearEntities = true,
	junkLines = 6,
} = {}) {
	if (clearEntities) matrix.forEach(e => e && e.id && e.remove())
	matrix.length = 0 // reset
	matrix.length = width * bufferHeight
	matrix.fill(undefined)

	if (!createEntities) return

	for (const y of range(0, junkLines - 1)) {
		let holeX = Math.floor(Math.random() * width)
		for (const x of range(0, width - 1)) {
			if (x == holeX) continue
			matrix[y * width + x] = makeMino({
				position: new Position(x, y),
				color: Color.Gray,
			})
		}
	}
}

/**
 * Returns wether the position is outside matrix bounds
 * @param {Position} position
 */
function isOOB(position) {
	return (
		position.x < 0 ||
		position.x >= width ||
		position.y < 0 ||
		position.y >= bufferHeight
	)
}

/**
 * Returns an array of the same size as its argument containing
 * the objects in the respective positions in the matrix or `true`
 * for positions outside of matrix bounds
 * @param {Position[]} positions the array of matrix positions to query
 */
export function queryMatrix(positions) {
	return positions.map(p => (isOOB(p) ? true : matrix[p.y * width + p.x]))
}

/**
 * Returns an array containing the objects in the matrix
 * at the position of the given tetromino
 * @param {Object} tetromino
 * @param {Direction} tetromino.direction
 * @param {Position} tetromino.position
 * @param {Tetrimino} tetromino.tetrimino
 */
export function queryTetromino({ direction, position, tetrimino }) {
	return queryMatrix(
		tetrimino.shape.get(direction).map(p => p.clone().add(position)),
	)
}

/**
 * Rotates the tetromino if possible, returns `false` otherwise
 * @param {Tetromino} tetromino
 * @param {"clockwise" | "counterClockwise"} rotation
 * @returns {false | Tetromino} `false` or the rotated tetromino
 */
export function rotateTetromino(tetromino, rotation = "clockwise") {
	let { direction, position, tetrimino } = tetromino

	// no-op
	if (tetrimino == Tetrimino.O) return arguments[0]

	let nextDirection = direction[rotation]
	let sourceAxes = tetrimino.axes.get(direction)
	let destAxes = tetrimino.axes.get(nextDirection)
	let nextPos = position.clone()
	let nextTetromino

	for (const [src, i] of range(sourceAxes)) {
		let dest = destAxes[i]
		nextPos
			.copy(position)
			.add(src)
			.sub(dest)
		nextTetromino = {
			direction: nextDirection,
			position: nextPos,
			tetrimino,
		}
		if (queryTetromino(nextTetromino).filter(Boolean).length == 0)
			return nextTetromino
	}

	return false
}

/**
 * Moves the tetromino if possible, returns `false` otherwise
 * @param {Tetromino} tetromino
 * @param {Position} delta
 * @returns {false | Tetromino} `false` or the moved tetromino
 */
export function moveTetromino({ direction, position, tetrimino }, delta) {
	let nextPos = position.clone().add(delta)
	let nextTetromino = {
		direction,
		tetrimino,
		position: nextPos,
	}
	if (queryTetromino(nextTetromino).filter(Boolean).length == 0)
		return nextTetromino
	else return false
}

/**
 * Returns the contents of the matrix for the line
 * @param {number} y The coordinate of the row to query
 */
export function queryLine(y) {
	let temps = Array(width)
		.fill(0)
		.map((_, x) => new Position(x, y))
	return queryMatrix(temps)
}

export class Tetrimino {
	static O = new Tetrimino("O")
	static I = new Tetrimino("I")
	static T = new Tetrimino("T")
	static L = new Tetrimino("L")
	static J = new Tetrimino("J")
	static S = new Tetrimino("S")
	static Z = new Tetrimino("Z")
	/**
	 * @param {"O" | "I" | "T" | "L" | "J" | "S" | "Z"} name
	 */
	constructor(name) {
		this.name = name
	}
	get color() {
		switch (this) {
			case Tetrimino.O:
				return Color.Yellow
			case Tetrimino.I:
				return Color.Cyan
			case Tetrimino.T:
				return Color.Purple
			case Tetrimino.L:
				return Color.Orange
			case Tetrimino.J:
				return Color.Blue
			case Tetrimino.S:
				return Color.Green
			case Tetrimino.Z:
				return Color.Red
		}
	}
	get shape() {
		return shapes.get(this)
	}

	get axes() {
		return axes.get(this)
	}

	toString() {
		return `Tetromino ${this.name}`
	}
}

export const tetriminos = [
	Tetrimino.O,
	Tetrimino.I,
	Tetrimino.T,
	Tetrimino.L,
	Tetrimino.J,
	Tetrimino.S,
	Tetrimino.Z,
]

export class Direction {
	static North = new Direction("North")
	static South = new Direction("South")
	static East = new Direction("East")
	static West = new Direction("West")

	/**
	 * @param {"North" | "South" | "East" | "West"} name
	 */
	constructor(name) {
		this.name = name
	}

	get clockwise() {
		switch (this) {
			case Direction.North:
				return Direction.East
			case Direction.South:
				return Direction.West
			case Direction.East:
				return Direction.South
			case Direction.West:
				return Direction.North
		}
	}

	get counterClockwise() {
		switch (this) {
			case Direction.North:
				return Direction.West
			case Direction.South:
				return Direction.East
			case Direction.East:
				return Direction.North
			case Direction.West:
				return Direction.South
		}
	}

	get opposite() {
		switch (this) {
			case Direction.North:
				return Direction.South
			case Direction.South:
				return Direction.North
			case Direction.East:
				return Direction.West
			case Direction.West:
				return Direction.East
		}
	}

	toString() {
		return `Direction ${this.name}`
	}
}

export const directions = [
	Direction.North,
	Direction.East,
	Direction.South,
	Direction.West,
]

export class Color {
	static Yellow = new Color("yellow")
	static Cyan = new Color("cyan")
	static Purple = new Color("purple")
	static Orange = new Color("orange")
	static Blue = new Color("blue")
	static Green = new Color("green")
	static Red = new Color("red")
	static Gray = new Color("gray")

	/**
	 * @param {"yellow" | "cyan" | "purple" | "orange" | "blue" | "green" | "red" | "gray"} name
	 */
	constructor(name) {
		this.name = name
	}

	get hex() {
		switch (this) {
			case Color.Yellow:
				return 0xffff00
			case Color.Cyan:
				return 0x00ffff
			case Color.Purple:
				return 0xff00ff
			case Color.Orange:
				return 0xffa500
			case Color.Blue:
				return 0x0000ff
			case Color.Green:
				return 0x00ff00
			case Color.Red:
				return 0xff0000
			case Color.Gray:
				return 0x808080
		}
	}

	toString() {
		return `${this.name}`
	}
}

class Bag {
	tetriminos = []

	refill() {
		let temp = [...tetriminos]
		do {
			this.tetriminos.push(
				temp.splice(Math.floor(Math.random() * temp.length), 1)[0],
			)
		} while (temp.length)
	}

	next() {
		if (!this.tetriminos.length) this.refill()
		return this.tetriminos.pop()
	}
}

export class NextQueue {
	constructor(size = 6) {
		this.bag = new Bag()
		this.size = size
		/** @type {Tetrimino[]} */
		this.tetriminos = []
		this.refill()
	}

	refill() {
		do {
			this.tetriminos.push(this.bag.next())
		} while (this.tetriminos.length < this.size)
	}

	next() {
		let t = this.tetriminos.shift()
		this.refill()
		return t
	}
}

function p(...arr) {
	let positions = [],
		i = 0
	do {
		positions.push(new Position(arr[i++], arr[i++]))
	} while (i < arr.length)
	return positions
}

export const shapes = new Map([
	[
		Tetrimino.O,
		new Map([
			[Direction.North, p(0, 0, 1, 0, 0, 1, 1, 1)],
			[Direction.South, p(0, 0, 1, 0, 0, 1, 1, 1)],
			[Direction.East, p(0, 0, 1, 0, 0, 1, 1, 1)],
			[Direction.West, p(0, 0, 1, 0, 0, 1, 1, 1)],
		]),
	],
	[
		Tetrimino.I,
		new Map([
			[Direction.North, p(0, 0, -1, 0, 1, 0, 2, 0)],
			[Direction.South, p(0, -1, -1, -1, 1, -1, 2, -1)],
			[Direction.East, p(1, 0, 1, -1, 1, 1, 1, -2)],
			[Direction.West, p(0, 0, 0, 1, 0, -1, 0, -2)],
		]),
	],
	[
		Tetrimino.T,
		new Map([
			[Direction.North, p(0, 0, -1, 0, 1, 0, 0, 1)],
			[Direction.South, p(0, 0, -1, 0, 1, 0, 0, -1)],
			[Direction.East, p(0, 0, 0, -1, 1, 0, 0, 1)],
			[Direction.West, p(0, 0, 0, -1, -1, 0, 0, 1)],
		]),
	],
	[
		Tetrimino.L,
		new Map([
			[Direction.North, p(0, 0, -1, 0, 1, 0, 1, 1)],
			[Direction.South, p(0, 0, -1, 0, 1, 0, -1, -1)],
			[Direction.East, p(0, 0, 0, 1, 0, -1, 1, -1)],
			[Direction.West, p(0, 0, 0, 1, 0, -1, -1, 1)],
		]),
	],
	[
		Tetrimino.J,
		new Map([
			[Direction.North, p(0, 0, -1, 0, 1, 0, -1, 1)],
			[Direction.South, p(0, 0, -1, 0, 1, 0, 1, -1)],
			[Direction.East, p(0, 0, 0, 1, 0, -1, 1, 1)],
			[Direction.West, p(0, 0, 0, 1, 0, -1, -1, -1)],
		]),
	],
	[
		Tetrimino.S,
		new Map([
			[Direction.North, p(0, 0, -1, 0, 0, 1, 1, 1)],
			[Direction.South, p(0, 0, 1, 0, 0, -1, -1, -1)],
			[Direction.East, p(0, 0, 1, 0, 0, 1, 1, -1)],
			[Direction.West, p(0, 0, -1, 0, 0, -1, -1, 1)],
		]),
	],
	[
		Tetrimino.Z,
		new Map([
			[Direction.North, p(0, 0, 1, 0, 0, 1, -1, 1)],
			[Direction.South, p(0, 0, -1, 0, 0, -1, 1, -1)],
			[Direction.East, p(0, 0, 1, 0, 0, -1, 1, 1)],
			[Direction.West, p(0, 0, -1, 0, 0, 1, -1, -1)],
		]),
	],
])

const axes = new Map([
	[
		Tetrimino.O,
		new Map([
			[Direction.North, p(0, 0)],
			[Direction.South, p(0, 0)],
			[Direction.East, p(0, 0)],
			[Direction.West, p(0, 0)],
		]),
	],
	[
		Tetrimino.I,
		new Map([
			[Direction.North, p(0, 0, -1, 0, 2, 0, -1, 0, 2, 0)],
			[Direction.South, p(0, 0, 2, 0, -1, 0, 2, -1, -1, -1)],
			[Direction.East, p(0, 0, 1, 0, 1, 0, 1, 1, 1, -2)],
			[Direction.West, p(0, 0, 0, 0, 0, 0, 0, -2, 0, 1)],
		]),
	],
	[
		Tetrimino.T,
		new Map([
			[Direction.North, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.South, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.East, p(0, 0, 1, 0, 1, -1, 0, 2, 1, 2)],
			[Direction.West, p(0, 0, -1, 0, -1, -1, 0, 2, -1, 2)],
		]),
	],
	[
		Tetrimino.L,
		new Map([
			[Direction.North, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.South, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.East, p(0, 0, 1, 0, 1, -1, 0, 2, 1, 2)],
			[Direction.West, p(0, 0, -1, 0, -1, -1, 0, 2, -1, 2)],
		]),
	],
	[
		Tetrimino.J,
		new Map([
			[Direction.North, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.South, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.East, p(0, 0, 1, 0, 1, -1, 0, 2, 1, 2)],
			[Direction.West, p(0, 0, -1, 0, -1, -1, 0, 2, -1, 2)],
		]),
	],
	[
		Tetrimino.S,
		new Map([
			[Direction.North, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.South, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.East, p(0, 0, 1, 0, 1, -1, 0, 2, 1, 2)],
			[Direction.West, p(0, 0, -1, 0, -1, -1, 0, 2, -1, 2)],
		]),
	],
	[
		Tetrimino.Z,
		new Map([
			[Direction.North, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.South, p(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)],
			[Direction.East, p(0, 0, 1, 0, 1, -1, 0, 2, 1, 2)],
			[Direction.West, p(0, 0, -1, 0, -1, -1, 0, 2, -1, 2)],
		]),
	],
])
