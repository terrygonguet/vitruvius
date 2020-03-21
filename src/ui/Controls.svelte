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

	tr {
		padding: 0.25rem;
		width: 100%;
	}

	th {
		text-align: end;
		padding-right: 0.5rem;
		width: 50%;
	}
</style>

<section
	class="border border-purple-500 rounded w-full max-w-1k p-4 text-justify absolute-center transform-center transform"
	in:fade={{ delay: 200, duration: 200 }}
	out:fade={{ duration: 200 }}>
	<h1 class="text-center text-4xl font-semibold mt-4 mb-8">Controls</h1>
	<p class="my-4">
		This game is meant for <strong class="text-purple-500">two players</strong> on a
		<strong class="text-purple-500">single computer</strong> ! One player will control
		the <strong class="text-purple-500">Tetris</strong> board on the left and the other
		player will control the <strong class="text-purple-500">Breakout</strong> board on
		the right. Both players must cooperate to get a Breakout ball all the way to the top
		of the Tetris board.
	</p>
	<p class="my-4">
		Both boards are <strong class="text-purple-500">the same board</strong>, the Tetris
		board shows the top and the Breakout board shows the bottom, with a few rows of overlap.
	</p>
	<div class="flex my-4">
		<div class="flex-1">
			<h2 class="text-center text-2xl font-semibold mb-4">Tetris</h2>
			<table class="w-full">
				<tr>
					<th>[Left/Right Arrow]</th>
					<td>Move current piece</td>
				</tr>
				<tr>
					<th>[Shift]</th>
					<td>Hold</td>
				</tr>
				<tr>
					<th>[Up Arrow]</th>
					<td>Rotate clockwise</td>
				</tr>
				<tr>
					<th>[Ctrl]</th>
					<td>Rotate counter clockwise</td>
				</tr>
				<tr>
					<th>[Down Arrow]</th>
					<td>Soft drop</td>
				</tr>
				<tr>
					<th>[Space]</th>
					<td>Hard drop</td>
				</tr>
			</table>
		</div>
		<div class="mx-4 border border-purple-500"></div>
		<div class="flex-1">
			<h2 class="text-center text-2xl font-semibold mb-4">Breakout</h2>
			<table class="w-full">
				<tr>
					<th>[A/D]</th>
					<td>Move paddle</td>
				</tr>
				<tr>
					<th>[S]</th>
					<td>New ball</td>
				</tr>
			</table>
		</div>
	</div>
	<div class="flex justify-center my-4">
		<Button on:click={() => emit("start")}>START</Button>
	</div>
</section>