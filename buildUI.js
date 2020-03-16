const svelte = require("svelte/compiler")
const fs = require("fs").promises

const compiled = []

async function compile(name = "App") {
	console.log(`Compiling ${name}.svelte...`)

	const app = await fs.readFile(`src/ui/${name}.svelte`)
	const { js, warnings, vars } = svelte.compile(app.toString(), {
		customElement: true,
		dev: true,
	})

	if (warnings.length) {
		return console.log(warnings)
	}

	await fs.writeFile(`src/ui/${name}.js`, js.code)

	compiled.push(name)

	for (const v of vars) {
		if (!compiled.includes(v.name)) await compile(v.name)
	}
}

compile()
	.then(() => console.log("Done!"))
	.catch(console.error)
