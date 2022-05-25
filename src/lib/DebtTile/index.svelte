<script lang="ts">
  import type { User, DebtWithId } from "$lib/database";

  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { Tile, Checkbox } from "carbon-components-svelte";
  import { TrashCan32 } from "carbon-icons-svelte";
  import ObjectID from "bson-objectid";

  const dispatch = createEventDispatcher<{ debtDelete: DebtWithId; error: string }>();

  export let debt: DebtWithId;
  export let currentUser: User = null;
  export let userFrom: User;
  export let userTo: User;

  let date = new Date(new ObjectID(debt._id as string).getTimestamp());

  const handleCheckboxTick = async (e) => {
    const url = `/api/debt/${debt._id}.json?is_paid=${e.target.checked}`;
    try {
      const response = await fetch(url, {
        method: "PATCH"
      });
      if (!response.ok) {
        debt.is_paid = !debt.is_paid;
        const responseError = (await response.json()).error;
        if (!responseError) {
          dispatch("error", `Status ${response.status}`);
        } else {
          dispatch("error", `${responseError}`);
        }
      }
    } catch (err) {
      dispatch("error", err);
    }
  };

  const notifyDebtDelete = () => {
    dispatch("debtDelete", debt);
  };
</script>

<Tile>
  <div class:gray={debt.is_paid}>
    <h4 class="bold wrap">{debt.description}</h4>
    <p class="small">
      {date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })}
    </p>
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
          notifyDebtDelete();
        }}
        class="display-flex border-none background-none cursor-pointer transition hover-red active-red"
      >
        <TrashCan32 aria-label="Delete" style="width: 1.45rem; height: 1.45rem;" />
      </button>
    </div>
  {/if}
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
    color: var(--cds-support-02);
  }

  .red {
    color: var(--cds-danger-01);
  }

  .gray {
    color: var(--cds-text-03);
  }

  .gray .green {
    color: rgba(var(--cds-support-02), 0.5);
  }

  .gray .red {
    color: rgba(var(--cds-danger-01), 0.5);
  }

  .transition {
    transition: 0.08s;
  }

  .hover-red:hover {
    color: var(--cds-danger-01);
  }

  .active-red:active {
    color: var(--cds-active-danger);
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

  .wrap {
    overflow-wrap: break-word;
  }
</style>
