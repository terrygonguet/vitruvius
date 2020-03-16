import { world, start, app, canvas } from "./globals.js"
import UIFiles from "./ui/files.js"

UIFiles.forEach(f => import(`./ui/${f}.js`))

app.loader
	.on("error", (err, loader, res) => {
		console.error(err, loader, res)
	})
	.on("complete", () => {
		document.addEventListener("keydown", e => {
			if (e.key == "Escape" || e.key == "F1") {
				world.enabled = !world.enabled
			} else if (e.key == "Enter") {
				start()
			}
		})
	})
	.load()
