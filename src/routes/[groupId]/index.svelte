<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import type { User } from "$lib/database";

  export const load: Load = async ({ page, fetch }) => {
    const { groupId } = page.params;

    const url = `/api/users/group/${groupId}.json`;

    try {
      const res = await fetch(url);

      if (!res.ok) {
        return {
          status: res.status,
          error: new Error(`Could not load ${url}`)
        };
      }

      const group = await res.json();
      if (!group) {
        return {
          status: 500,
          error: new Error(`Could not get group`)
        };
      }

      return {
        props: {
          groupId: group._id,
          groupName: group.name,
          users: group.users,
          currentUserId: group.users[0]._id,
          debts: group.debts
        }
      };
    } catch (err) {
      return {
        status: 500,
        error: new Error(`${err}`)
      };
    }
  };
</script>

<script lang="ts">
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import { Header, Content, Grid, Row, Column } from "carbon-components-svelte";
  import DebtForm from "$lib/DebtForm/index.svelte";
  import DebtTile from "$lib/DebtTile/index.svelte";
  import AmountOwed from "$lib/AmountOwed/index.svelte";
  import type { DebtWithId } from "$lib/database";

  const animateFlipDuration = 200;

  export let groupId: string;
  export let groupName: string;
  export let users: User[];
  export let currentUserId: string;
  export let debts: DebtWithId[];

  $: {
    // If `debts` is an empty object (like when the database is still empty),
    // we let it be an empty array instead.
    if (debts && Object.keys(debts).length === 0 && debts.constructor === Object) {
      debts = [];
    }
  }

  $: debtsOfCurrentUser = debts.filter(
    (d) => d.debtor_id === currentUserId || d.debtee_id === currentUserId
  );

  const handleDebtCreate = (e) => {
    debts = [...debts, e.detail];

    fetch(`/api/debt.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e.detail)
    }).catch((err) => {
      console.error(err);
    });
  };

  const handleDebtDelete = (e) => {
    debts = debts.filter((d) => d._id !== e.detail);

    const url = `/api/debt/${e.detail}.json`;
    fetch(url, {
      method: "DELETE"
    }).catch((err) => {
      console.error(err);
    });
  };

  $: handleAllDebtsPaid = (e) => {
    let debtIdsToMarkAsPaid = [];
    debts = debts.map((d) => {
      if (
        (d.debtor_id === e.detail.from && d.debtee_id === e.detail.to) ||
        (d.debtor_id === e.detail.to && d.debtee_id === e.detail.from)
      ) {
        d.is_paid = true;
        debtIdsToMarkAsPaid = [...debtIdsToMarkAsPaid, d._id];
      }
      return d;
    });

    fetch(`/api/debt/mark-paid?${debtIdsToMarkAsPaid.join("&")}`, {
      method: "PATCH"
    }).catch((err) => {
      console.error(err);
    });
  };
</script>

<Header company="Ootang" platformName={groupName} />

<Content>
  <Grid>
    <DebtForm
      {users}
      on:debtCreate={handleDebtCreate}
      on:select={(e) => {
        currentUserId = e.detail.selectedItem.id;
      }}
    />
    {#if debtsOfCurrentUser.length === 0}
      <Row>
        <Column>
          <p>Nothing to pay ✨</p>
        </Column>
      </Row>
    {:else}
      <Row padding>
        <Column>
          <AmountOwed {debts} {users} {currentUserId} on:allDebtsPaid={handleAllDebtsPaid} />
        </Column>
      </Row>
      <Row padding>
        <Column>
          <!-- FIXME: Find out how to prevent scrollbars from showing up during the animations. -->
          <div class="display-flex flex-wrap gap">
            {#each debtsOfCurrentUser as debt (debt._id)}
              <div
                transition:fade={{ duration: 80 }}
                animate:flip={{ duration: animateFlipDuration }}
                style="min-width: 6rem; max-width: 16rem;"
              >
                <DebtTile
                  bind:debt
                  currentUser={users.find((u) => u._id === currentUserId)}
                  userFrom={users.find((u) => u._id === debt.debtor_id)}
                  userTo={users.find((u) => u._id === debt.debtee_id)}
                  on:debtDelete={handleDebtDelete}
                />
              </div>
            {/each}
          </div>
        </Column>
      </Row>
    {/if}
  </Grid>
</Content>

<style>
  .display-flex {
    display: flex;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .gap {
    gap: 1rem;
  }
</style>
