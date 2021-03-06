<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Button } from "carbon-components-svelte";
  import type { User, DebtWithId } from "$lib/database";

  const dispatch = createEventDispatcher<{ allDebtsPaid: { from: string; to: string } }>();

  export let debts: DebtWithId[];
  export let users: User[];
  export let currentUserId: string;

  $: totalAmountOwed = (userFromId: string, userToId: string) => {
    return debts
      .filter((d) => {
        if (
          ((d.debtor_id === userFromId && d.debtee_id === userToId) ||
            (d.debtor_id === userToId && d.debtee_id === userFromId)) &&
          !d.is_paid
        ) {
          return true;
        }
        return false;
      })
      .map((d) => {
        if (d.debtor_id === userFromId) {
          return d.amount;
        }
        if (d.debtee_id === userFromId) {
          return -d.amount;
        }
      })
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  };

  const notifyAllDebtsPaid = (userFromId: string, userToId: string) => {
    dispatch("allDebtsPaid", {
      from: userFromId,
      to: userToId
    });
  };
</script>

{#each users.filter((u) => u._id !== currentUserId) as otherUser}
  {#if totalAmountOwed(currentUserId, otherUser._id) !== 0}
    <div class="display-flex flex-direction-row align-items-center gap">
      <p>
        {#if totalAmountOwed(currentUserId, otherUser._id) > 0}
          You owe <span class="bold">
            {otherUser.name}
          </span>
          a total of
          <span class="red">
            ₱{totalAmountOwed(currentUserId, otherUser._id).toFixed(2)}
          </span>
        {:else if totalAmountOwed(currentUserId, otherUser._id) < 0}
          <span class="bold">
            {otherUser.name}
          </span>
          owes you a total of
          <span class="green">
            ₱{totalAmountOwed(otherUser._id, currentUserId).toFixed(2)}
          </span>
        {/if}
      </p>
      <Button
        kind="ghost"
        size="small"
        on:click={() => notifyAllDebtsPaid(currentUserId, otherUser._id)}>Mark all as paid</Button
      >
    </div>
  {/if}
{/each}

<style>
  .display-flex {
    display: flex;
  }

  .flex-direction-row {
    flex-direction: row;
  }

  .align-items-center {
    align-items: center;
  }

  .gap {
    gap: 1rem;
  }

  .green {
    color: var(--cds-support-02);
  }

  .red {
    color: var(--cds-danger-01);
  }

  .bold {
    font-weight: bold;
  }
</style>
