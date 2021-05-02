<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";

  export const load: Load = async ({ fetch }) => {
    const defaultUsers = {
      userFrom: "0",
      userTo: "1"
    };

    const url = `/api/debt.json?user=${defaultUsers.userFrom}`;
    const res = await fetch(url);
    const result = await res.json();

    if (res.ok) {
      return {
        props: {
          userFrom: defaultUsers.userFrom,
          userTo: defaultUsers.userTo,
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
  import type { DataWithId } from "$lib/database";

  const people = [
    {
      id: "0",
      text: "Grant"
    },
    {
      id: "1",
      text: "Gaela"
    },
    {
      id: "2",
      text: "Daddy"
    }
  ];

  export let userFrom: string;
  export let userTo: string;
  export let debts: DataWithId[];

  // FIXME: Probably cache these results.
  const fetchDebtsFromDatabase = async (user: string) => {
    const url = `http://localhost:3000/api/debt.json?user=${user}`;
    await fetch(url)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        debts = data;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  $: fetchDebtsFromDatabase(userFrom);
  
  const handleDebtDelete = (e) => {
    debts = debts.filter((d) => d.id !== e.detail);
  }
</script>

<Header company="Ootang" platformName="IOU Tracker" />

<Content>
  <Grid>
    <DebtForm
      users={people}
      bind:userFrom
      bind:userTo
      on:submit={fetchDebtsFromDatabase(userFrom)}
    />
    {#if debts.length === 0}
      <Row>
        <Column>
          <p>Nothing to pay ✨</p>
        </Column>
      </Row>
    {:else}
      <Row padding>
        {#each debts as debt (debt.id)}
          <Column sm={2} md={3}>
            <DebtTile
              bind:debt
              userFrom={people.find((p) => p.id === debt.from)}
              userTo={people.find((p) => p.id === debt.to)}
              on:debtDelete={handleDebtDelete}
            />
          </Column>
        {/each}
      </Row>
    {/if}
  </Grid>
</Content>
