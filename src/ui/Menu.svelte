<script>
	import Button from "./Button.svelte.js"
	import { createEventDispatcher } from "svelte"
	import { fade } from "svelte/transition"

	const emit = createEventDispatcher()
</script>

<style>
	section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto 20vh;
		grid-template-areas:
			"title title"
			"btn1  btn2";
		background-color: rgba(255,255,255,0.1);
		place-items: center;
	}
</style>

<section
	class="border border-purple-500 rounded w-full max-w-1k absolute-center transform-center transform"
	in:fade={{ delay: 200, duration: 200 }}
	out:fade={{ duration: 200 }}>
	<h1 style="grid-area:title" class="text-center text-4xl font-semibold my-8">Project Vitruvius</h1>
	<Button style="grid-area:btn1" on:click={() => emit("teachme")}>Tell me how to play</Button>
	<Button style="grid-area:btn2" on:click={() => emit("start")}>START</Button>
</section>