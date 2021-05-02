<script lang="ts">
  import { Header, Content, Grid, Row, Column } from "carbon-components-svelte";
  import DebtForm from "$lib/DebtForm/index.svelte";

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

  let userFrom = "0";
  let userTo = "1";
</script>

<Header company="Ootang" platformName="IOU Tracker" />

<Content>
  <Grid>
    <DebtForm users={people} bind:userFrom bind:userTo />
    <Row padding>
      <Column>
        <code>userFrom: {userFrom}, type {typeof userFrom}</code><br />
        <code>userTo: {userTo}, type {typeof userTo}</code>
      </Column>
    </Row>
  </Grid>
</Content>
