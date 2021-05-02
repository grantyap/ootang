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
  import { Header, Content, Grid, Row, Column, Tile } from "carbon-components-svelte";
  import DebtForm from "$lib/DebtForm/index.svelte";
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
</script>

<Header company="Ootang" platformName="IOU Tracker" />

<Content>
  <Grid>
    <DebtForm users={people} bind:userFrom bind:userTo on:submit={fetchDebtsFromDatabase(userFrom)}/>
    <Row padding>
      <Column>
        <code>{JSON.stringify(debts)}</code>
      </Column>
    </Row>
    <Row padding>
      <Column>
        <p>userFrom: {userFrom}</p>
        <p>userTo: {userTo}</p>
      </Column>
    </Row>
    {#if debts.length === 0}
      <Row>
        <Column>
          <p>Nothing to pay ✨</p>
        </Column>
      </Row>
    {:else}
      {#each debts as debt}
        <Row padding>
          <Column sm={2}>
            <Tile>
              <h3>{debt.description}</h3>
              <p><strong>From:</strong> {people[debt.from].text}</p>
              <p><strong>To:</strong> {people[debt.to].text}</p>
              <p><strong>Amount:</strong> ₱{debt.amount.toFixed(2)}</p>
              <p><strong>Description:</strong> {debt.description}</p>
              <p><strong>Was paid</strong>: {debt.is_paid}</p>
            </Tile>
          </Column>
        </Row>
      {/each}
    {/if}
  </Grid>
</Content>
