<script lang="ts">
  import type { User, DebtWithId } from "$lib/database";

  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { Tile, Checkbox, Modal } from "carbon-components-svelte";
  import { TrashCan32 } from "carbon-icons-svelte";

  const dispatch = createEventDispatcher();

  export let debt: DebtWithId;
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
    const url = `/api/debt/${debt._id}.json${queryString}`;
    fetch(url, {
      method: "PATCH"
    });
  };

  const handleDelete = () => {
    dispatch("debtDelete", debt._id);

    const url = `/api/debt/${debt._id}.json`;
    fetch(url, {
      method: "DELETE"
    });
  };
</script>

<Tile>
  <div class:gray={debt.is_paid}>
    <h4 class="bold">{debt.description}</h4>
    <p>
      <span class="small">From:</span>
      <span
        class:bold={debt.debtor_id === currentUser._id}
        class:red={debt.debtor_id === currentUser._id}
      >
        {userFrom.name}
      </span>
    </p>
    <p>
      <span class="small">To:</span>
      <span
        class:bold={debt.debtee_id === currentUser._id}
        class:green={debt.debtee_id === currentUser._id}
      >
        {userTo.name}
      </span>
    </p>
    <p><span class="small">Amount:</span> ₱{debt.amount.toFixed(2)}</p>
  </div>
  <br />
  <Checkbox labelText="Paid" bind:checked={debt.is_paid} on:change={handleCheckboxTick} />
  {#if debt.is_paid}
    <div class="absolute bottom-spacing right-spacing" transition:fade={{ duration: 80 }}>
      <button
        on:click={() => {
          isDeleteModalOpen = !isDeleteModalOpen;
        }}
        class="display-flex border-none background-none cursor-pointer"
      >
        <TrashCan32 aria-label="Delete" style="width: 1.45rem; height: 1.45rem;" />
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
    bottom: 1.4rem;
  }

  .right-spacing {
    right: 0.7rem;
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
