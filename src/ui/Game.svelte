<script>
	import { createEventDispatcher, onMount } from "svelte"
	import { fade } from "svelte/transition"
	import { world, bus } from "../globals.js"
	import TetrisSystem from "../systems/tetris.js"
	import { _ } from "../tools.js"

	const emit = createEventDispatcher()
	let system,
		held = "T",
		queue = []

	onMount(() => {
		system = world.getSystem(TetrisSystem)
		held = system.held.name
		queue =
			system.queue.tetriminos
				.map(_("name"))
				.filter((n, i) => i < 5)
		bus.addEventListener(
			"tetrisqueuechange",
			({ detail }) => {
				queue =
					detail.queue.tetriminos
						.map(_("name"))
						.filter((n, i) => i < 5)
			}
		)
		bus.addEventListener(
			"tetrisheldchange",
			({ detail }) => (held = detail.held.name)
		)
	})
</script>

<style>
	img {
		image-rendering: crisp-edges;
	}
</style>

<section
	class="absolute-center transform-center transform h-full flex flex-col justify-start items-center mt-32"
	in:fade={{ delay: 200, duration: 200 }}
	out:fade={{ duration: 200 }}>
	<p class="text-center text-xl">HELD</p>
	<div class="border-2 border-white w-32 h-32 p-2 mb-4">
		<img src="img/{held}.png" alt="" class="w-full h-full object-contain">
	</div>
	<p class="text-center">NEXT</p>
	<div class="border-2 border-white p-2 flex flex-col justify-center items-center">
		{#each queue as q}
			<img src="img/{q}.png" alt="" class="w-20 h-20 object-contain">
		{/each}
	</div>
</section>