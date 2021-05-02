<script lang="ts">
  import type { DataWithId } from "$lib/database";

  type User = {
    id: string;
    text: string;
  };

  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { Tile, Checkbox, Modal } from "carbon-components-svelte";
  import { TrashCan32 } from "carbon-icons-svelte";

  const dispatch = createEventDispatcher();

  export let debt: DataWithId;
  export let currentUser: User = null;
  export let userFrom: User;
  export let userTo: User;

  let shouldDelete = false;
  let isDeleteModalOpen = false;

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

<Tile>
  <div class:gray={debt.is_paid}>
    <h3>{debt.description}</h3>
    <p>
      <span class="small">From:</span>
      <span class:bold={debt.from === currentUser.id} class:red={debt.from === currentUser.id}>
        {userFrom.text}
      </span>
    </p>
    <p>
      <span class="small">To:</span>
      <span class:bold={debt.to === currentUser.id} class:green={debt.to === currentUser.id}>
        {userTo.text}
      </span>
    </p>
    <p><span class="small">Amount:</span> ₱{debt.amount.toFixed(2)}</p>
  </div>
  <br />
  <Checkbox labelText="Paid" bind:checked={debt.is_paid} on:change={handleCheckboxTick} />
  {#if debt.is_paid}
    <div class="absolute bottom-spacing right-spacing" transition:fade={{ duration: 100 }}>
      <button
        on:click={() => {
          isDeleteModalOpen = !isDeleteModalOpen;
        }}
        class="display-flex border-none background-none cursor-pointer"
      >
        <TrashCan32 aria-label="Delete" style="scale: 75%;" />
      </button>
    </div>
  {/if}
  <Modal
    bind:open={isDeleteModalOpen}
    modalHeading="Delete card"
    primaryButtonText="Delete"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => {
      isDeleteModalOpen = !isDeleteModalOpen;
    }}
    on:submit={() => {
      shouldDelete = true;
      isDeleteModalOpen = !isDeleteModalOpen;
    }}
    on:transitionend={() => {
      if (shouldDelete) {
        handleDelete();
      }
    }}
  >
    Are you sure you want to delete {debt.description ? `"${debt.description}"` : "this card"}?
  </Modal>
</Tile>

<style>
  .display-flex {
    display: flex;
  }

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
  
  .red {
    color: rgb(243, 19, 3);
  }

  .gray {
    color: #aaa;
  }

  .absolute {
    position: absolute;
  }

  .bottom-spacing {
    bottom: 1.1rem;
  }

  .right-spacing {
    right: 0.3rem;
  }

  .border-none {
    border: none;
  }

  .background-none {
    background: none;
  }

  .cursor-pointer {
    cursor: pointer;
  }
</style>
