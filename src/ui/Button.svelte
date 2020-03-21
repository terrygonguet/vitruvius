<script>
	export let style = ""
</script>

<button
	{style}
	class="bg-purple-800 hover:bg-purple-600 transition-colors duration-300 ease-in-out px-8 py-4"
	on:click>
	<slot>Missing content</slot>
</button>