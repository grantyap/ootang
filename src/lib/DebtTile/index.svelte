<script lang="ts">
  import { Row, Column, Tile } from "carbon-components-svelte";

  export let debt;
  export let userFrom;
  export let userTo;
</script>

<Row padding>
  <Column sm={2}>
    <Tile>
      <h3>{debt.description}</h3>
      <p>
        <span class="small">From:</span>
        <span class:bold={debt.from === userFrom.id} class:green={debt.from === userFrom.id}>
          {userFrom.text}
        </span>
      </p>
      <p>
        <span class="small">To:</span>
        <span class:bold={debt.to === userFrom.id} class:green={debt.to === userFrom.id}>
          {userTo.text}
        </span>
      </p>
      <p><span class="small">Amount:</span> ₱{debt.amount.toFixed(2)}</p>
      <p><span class="small">Was paid</span>: {debt.is_paid}</p>
    </Tile>
  </Column>
</Row>

<style>
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
</style>
