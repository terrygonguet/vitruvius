<script>
	import Button from "./Button.svelte.js"
	import { createEventDispatcher } from "svelte"
	import { fade } from "svelte/transition"

	export let reason = ""

	const emit = createEventDispatcher()
</script>

<section
	class="border border-purple-500 rounded bg-black w-full max-w-1k p-4 text-justify absolute-center transform-center transform"
	in:fade={{ delay: 200, duration: 200 }}
	out:fade={{ duration: 200 }}>
	<h1 class="text-center text-6xl scale-150 font-bold">Game Over</h1>
	<h1 class="text-center text-4xl font-bold">{reason}</h1>
	<div class="flex justify-center mt-8">
		<Button on:click={() => emit("tryagain")}>Try again</Button>
	</div>
</section>