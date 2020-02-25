import { World } from "ecsy"
import { Application } from "pixi.js"
import Position from "./components/position.js"
import { range } from "./tools.js"

export const canvas = document.querySelector("#canvas")

export const app = new Application({
	view: canvas,
	resizeTo: window,
	autoDensity: true,
	autoStart: false,
	sharedTicker: true,
})

export const stage = app.stage

export const ticker = app.ticker

export const world = new World()

/** @type {Color[]} */
export const matrix = new Array(10 * 40).fill(undefined)

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

	get clockWise() {
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

function p(...arr) {
	let positions = []
	for (const i of range(0, 7, 2)) {
		positions.push(new Position(arr[i], arr[i + 1]))
	}
	return positions
}

const shapes = new Map([
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
