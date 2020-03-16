<script>
  import Title from "./Title.js";
</script>

<style>
  main {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: white;
    font-size: 1.125rem;
  }
</style>

<svelte:options tag="ui-app" />

<main>
  <ui-title />
</main>
