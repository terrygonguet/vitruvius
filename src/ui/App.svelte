<script>
	import Menu from "./Menu.svelte.js"
	import Controls from "./Controls.svelte.js"
	import Game from "./Game.svelte.js"
	import GameOver from "./GameOver.svelte.js"
	import { createEventDispatcher, onMount } from "svelte";
	import { bus } from "../globals.js"

	const emit = createEventDispatcher()

	let state = "menu",
		countdown = 3,
		gameover

	function start() {
		state = "countdown"
		countdown = 3
		setTimeout(function cb() {
			countdown--
			if (countdown <= 0) {
				state = "game"
				emit("start")
			} else setTimeout(cb, 1000)
		}, 1000)
	}

	onMount(() => {
		bus.addEventListener("gameover", ({ detail }) => {
			gameover = detail
			state = "gameover"
		})
	})
</script>

<style>
	.countdown {
		animation: countdown 1s ease-out 3 forwards;
	}

	@keyframes countdown {
		from {
			transform: translateX(var(--transform-translate-x)) translateY(var(--transform-translate-y)) rotate(var(--transform-rotate)) skewX(var(--transform-skew-x)) skewY(var(--transform-skew-y)) scale(4);
		}
		to {
			transform: translateX(var(--transform-translate-x)) translateY(var(--transform-translate-y)) rotate(var(--transform-rotate)) skewX(var(--transform-skew-x)) skewY(var(--transform-skew-y)) scale(0);
		}
	}
</style>

<main class="fixed top-0 left-0 w-screen h-screen text-white text-lg">
	{#if state == "menu"}
		<Menu on:start={start} on:teachme={() => (state = "controls")}/>
	{:else if state == "controls"}
		<Controls on:start={start} />
	{:else if state == "countdown"}
		<h1 class="text-6xl font-bold font-mono absolute-center transform-center transform countdown">
			{countdown}
		</h1>
	{:else if state == "game"}
		<Game />
	{:else if state == "gameover"}
		<GameOver reason={gameover} on:tryagain={start} />
	{/if}
</main>
