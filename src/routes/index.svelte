<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import type { User } from "$lib/database";

  export const load: Load = async ({ fetch }) => {
    const users: User[] = await fetch(`/api/users.json`).then((res) => {
      return res.json();
    });

    const url = `/api/debt.json?user=${users[0]._id}`;
    const res = await fetch(url);

    if (res.ok) {
      const result = await res.json();
      return {
        props: {
          users: users,
          currentUserId: users[0]._id,
          debts: result
        }
      };
    }

    return {
      status: res.status,
      error: new Error(`Could not load ${url}`)
    };
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

  // FIXME: Probably cache these results.
  const fetchDebtsFromDatabase = async (userId: string) => {
    const url = `/api/debt.json?user=${userId}`;
    const res = await fetch(url);
    debts = await res.json();
  };

  const handleDebtCreate = async (e) => {
    debts = [...debts, e.detail];

    await fetch(`/api/debt.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e.detail)
    });

    await fetchDebtsFromDatabase(currentUserId);
  };

  const handleDebtDelete = async (e) => {
    debts = debts.filter((d) => d._id !== e.detail);

    const url = `/api/debt/${e.detail}.json`;
    await fetch(url, {
      method: "DELETE"
    });

    await fetchDebtsFromDatabase(currentUserId);
  };
</script>

<Header company="Ootang" platformName="IOU Tracker" />

<Content>
  <Grid>
    <DebtForm
      {users}
      on:debtCreate={handleDebtCreate}
      on:select={async (e) => {
        currentUserId = e.detail.selectedItem.id;
        await fetchDebtsFromDatabase(currentUserId);
      }}
    />
    {#if debts.length === 0}
      <Row>
        <Column>
          <p>Nothing to pay ✨</p>
        </Column>
      </Row>
    {:else}
      <Row>
        <Column>
          <AmountOwed {debts} {users} {currentUserId} />
        </Column>
      </Row>
      <Row padding>
        <Column>
          <!-- FIXME: Find out how to prevent scrollbars from showing up during the animations. -->
          <div class="display-flex flex-wrap gap">
            {#each debts as debt (debt._id)}
              <div
                transition:fade={{ duration: 80 }}
                animate:flip={{ duration: 200 }}
                on:outroend={async () => {
                  await fetchDebtsFromDatabase(currentUserId);
                }}
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
