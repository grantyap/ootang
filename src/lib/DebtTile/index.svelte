<script lang="ts">
  import type { DataWithId } from "$lib/database";

  import { createEventDispatcher } from "svelte";
  import { Tile, Checkbox, Button } from "carbon-components-svelte";
  
  const dispatch = createEventDispatcher();

  export let debt: DataWithId;
  export let userFrom;
  export let userTo;

  $: opacity = debt.is_paid ? 0.5 : 1;

  const handleCheckboxTick = () => {
    // NOTE: on:change seems to happen before Svelte can update
    //       the binded variable. This means that if we untick
    //       the checkbox, `debt.is_paid` is still true by the
    //       time we enter this callback.
    //       Thus, we check NOT `debt.is_paid`.
    const queryString = !debt.is_paid ? `?is_paid` : "";
    const url = `/api/debt/${debt.id}.json${queryString}`;
    fetch(url, {
      method: "PATCH"
    });
  };

  const handleDelete = () => {
    dispatch("debtDelete", debt.id);

    const url = `/api/debt/${debt.id}.json`;
    fetch(url, {
      method: "DELETE"
    });
  };
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
  <Checkbox
    labelText="Paid"
    bind:checked={debt.is_paid}
    on:change={handleCheckboxTick}
    style="flex: 1; flex-direction: row-reverse;"
  />
  <Button on:click={handleDelete}>Delete</Button>
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
