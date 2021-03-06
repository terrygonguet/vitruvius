import { world, start, app, canvas, bus } from "./globals.js"
import App from "./ui/App.svelte.js"

app.loader
	.on("error", (err, loader, res) => {
		console.error(err, loader, res)
	})
	.on("complete", () => {
		document.addEventListener("keydown", e => {
			if (e.key == "Escape" || e.key == "F1") {
				world.enabled = !world.enabled
			}
		})
		bus.addEventListener("gameover", () => (world.enabled = false))

		const ui = new App({
			target: document.querySelector("#app"),
		})
		ui.$on("start", start)
	})
	.load()
