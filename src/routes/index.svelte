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
          userFrom: users[0]._id,
          userTo: users[1]._id,
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
  import { Header, Content, Grid, Row, Column } from "carbon-components-svelte";
  import DebtForm from "$lib/DebtForm/index.svelte";
  import DebtTile from "$lib/DebtTile/index.svelte";
  import type { DebtWithId } from "$lib/database";

  export let users: User[];
  export let userFrom: string;
  export let userTo: string;
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
    const res = await fetch(url).then((res) => res.json());
    debts = res;
  };

  const handleDebtDelete = (e) => {
    debts = debts.filter((d) => d._id !== e.detail);
  };
</script>

<Header company="Ootang" platformName="IOU Tracker" />

<Content>
  <Grid>
    <DebtForm
      {users}
      on:submit={() => {
        fetchDebtsFromDatabase(userFrom);
      }}
      on:click={() => {
        fetchDebtsFromDatabase(userFrom);
      }}
      on:select={(e) => {
        userFrom = e.detail.selectedItem.id;
        fetchDebtsFromDatabase(userFrom);
      }}
    />
    {#if debts.length === 0}
      <Row>
        <Column>
          <p>Nothing to pay ✨</p>
        </Column>
      </Row>
    {:else}
      <Row padding>
        {#each debts as debt (debt._id)}
          <Column sm={2} md={3}>
            <DebtTile
              bind:debt
              currentUser={users.find((u) => u._id === userFrom)}
              userFrom={users.find((u) => u._id === debt.debtor_id)}
              userTo={users.find((u) => u._id === debt.debtee_id)}
              on:debtDelete={handleDebtDelete}
            />
          </Column>
        {/each}
      </Row>
    {/if}
  </Grid>
</Content>
