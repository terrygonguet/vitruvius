const svelte = require("svelte/compiler")
const fs = require("fs").promises

async function compile(name) {
	console.log(`Compiling ${name}...`)

	const app = await fs.readFile(`src/ui/${name}`)
	const { js, warnings, vars } = svelte.compile(app.toString(), {
		dev: process.env.NODE_ENV != "production",
	})

	if (warnings.length) console.log(warnings)

	await fs.writeFile(`src/ui/${name}.js`, js.code)
}

fs.readdir("src/ui")
	.then(async files => {
		let svelteFiles = files.filter(f => f.endsWith(".svelte"))
		for (const file of svelteFiles) await compile(file)
	})
	.then(() => console.log("Done!"))
	.catch(console.error)
