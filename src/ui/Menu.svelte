<script>
	import Button from "./Button.svelte.js"
	import { createEventDispatcher } from "svelte"
	import { fade } from "svelte/transition"

	const emit = createEventDispatcher()
</script>

<style>
	section {
		background-color: rgba(255,255,255,0.1);
	}
</style>

<section
	class="border border-purple-500 rounded w-full max-w-1k absolute-center transform-center transform"
	in:fade={{ delay: 200, duration: 200 }}
	out:fade={{ duration: 200 }}>
	<h1 class="text-center text-4xl font-bold my-8 uppercase">Project Vitruvius</h1>
	<h2 class="text-center text-2xl">This game is a <strong class="text-purple-500">prototype</strong>, don't expect much.</h2>
	<div class="p-16 flex justify-around">
		<Button on:click={() => emit("teachme")}>Tell me how to play</Button>
		<Button on:click={() => emit("start")}>START</Button>
	</div>
</section>