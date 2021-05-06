<script lang="ts">
  import type { User, DebtWithId } from "$lib/database";

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
</script>

{#each users.filter((u) => u._id !== currentUserId) as otherUser}
  <p>
    {#if totalAmountOwed(currentUserId, otherUser._id) > 0}
      You owe <span class="bold">
        {otherUser.name}
      </span>
      a total of
      <span class="red">
        ₱{totalAmountOwed(currentUserId, otherUser._id)}
      </span>
    {:else if totalAmountOwed(currentUserId, otherUser._id) < 0}
      <span class="bold">
        {otherUser.name}
      </span>
      owes you a total of
      <span class="green">
        ₱{totalAmountOwed(otherUser._id, currentUserId)}
      </span>
    {/if}
  </p>
{/each}

<style>
  .green {
    color: rgb(12, 158, 90);
  }

  .red {
    color: rgb(243, 19, 3);
  }

  .bold {
    font-weight: bold;
  }
</style>
