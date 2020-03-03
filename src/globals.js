import { World } from "ecsy"
import { Application } from "pixi.js"

export const canvas = document.querySelector("#canvas")

export const app = new Application({
	view: canvas,
	resizeTo: window,
	autoDensity: true,
	autoStart: false,
})

export const stage = app.stage

export const ticker = app.ticker

export const world = new World()
