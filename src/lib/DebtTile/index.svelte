<script lang="ts">
  import { Tile, Checkbox } from "carbon-components-svelte";

  export let debt;
  export let userFrom;
  export let userTo;

  let checked = false;
  
  $: opacity = checked ? 0.5 : 1;
</script>

<Tile style="opacity: {opacity};">
  <h3>{debt.description}</h3>
  <p>
    <span class="small">From:</span>
    <span class:bold={debt.from === userFrom.id} class:green={debt.from === userFrom.id}>
      {userFrom.text}
    </span>
  </p>
  <p>
    <span class="small">To:</span>
    <span class:bold={debt.to === userFrom.id} class:green={debt.to === userFrom.id}>
      {userTo.text}
    </span>
  </p>
  <p><span class="small">Amount:</span> ₱{debt.amount.toFixed(2)}</p>
  <Checkbox labelText="Paid" bind:checked style="flex: 1; flex-direction: row-reverse;" />
</Tile>

<style>
  .small {
    font-size: 0.875rem;
    font-weight: lighter;
  }

  .bold {
    font-weight: bold;
  }

  .green {
    color: rgb(12, 158, 90);
  }
</style>
