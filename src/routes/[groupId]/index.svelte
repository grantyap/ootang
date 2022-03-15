<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import type { GroupData, User } from "$lib/database";

  export const load: Load = async ({ url, params, fetch }) => {
    const { groupId } = params;

    const apiUrl = `/api/users/group/${groupId}.json`;

    try {
      const res = await fetch(apiUrl);

      if (!res.ok) {
        return {
          status: res.status,
          error: new Error(`Could not load ${apiUrl}`)
        };
      }

      const group: GroupData = await res.json();
      if (!group) {
        return {
          status: 500,
          error: new Error(`Could not get group`)
        };
      }

      return {
        props: {
          groupName: group.name,
          users: group.users,
          currentUserId: group.users[0]._id,
          debts: group.debts,
          manifestUrl: url
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
  import { Header, Content, Grid, Row, Column, Modal } from "carbon-components-svelte";
  import DebtForm from "$lib/DebtForm/index.svelte";
  import DebtTile from "$lib/DebtTile/index.svelte";
  import AmountOwed from "$lib/AmountOwed/index.svelte";
  import type { DebtWithId } from "$lib/database";

  const animateFlipDuration = 200;

  export let groupName: string;
  export let users: User[];
  export let currentUserId: string;
  export let debts: DebtWithId[];
  export let manifestUrl: string;

  let isDeleteModalOpen = false;
  let debtToDelete: DebtWithId | null = null;
  let errorMessage: string | null = null;

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

  const cloneDebts = () => {
    return JSON.parse(JSON.stringify(debts));
  };

  const handleDebtCreate = async (e) => {
    errorMessage = null;
    const oldDebts = cloneDebts();

    debts = [e.detail, ...debts];

    try {
      const response = await fetch(`/api/debt.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(e.detail)
      });
      if (!response.ok) {
        debts = oldDebts;
        errorMessage = `Creation failed. Status ${response.status} ${response.statusText}`;
      }
    } catch (err) {
      debts = oldDebts;
      errorMessage = err;
    }
  };

  const handleDebtDelete = (e) => {
    isDeleteModalOpen = true;
    debtToDelete = e.detail;
  };

  const deleteDebt = async () => {
    errorMessage = null;

    try {
      const response = await fetch(`/api/debt/${debtToDelete._id}.json`, {
        method: "DELETE"
      });
      if (!response.ok) {
        errorMessage = `Delete failed. Status ${response.status} ${response.statusText}`;
        return;
      }

      debts = debts.filter((d) => d._id !== debtToDelete._id);
    } catch (err) {
      errorMessage = err;
    }
  };

  const handleAllDebtsPaid = async (e) => {
    errorMessage = null;
    const oldDebts = cloneDebts();

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

    try {
      const response = await fetch(`/api/debt/mark-paid?${debtIdsToMarkAsPaid.join("&")}`, {
        method: "PATCH"
      });
      if (!response.ok) {
        debts = oldDebts;
        errorMessage =
          "Could not mark all debts as paid." + ` Status ${response.status} ${response.statusText}`;
      }
    } catch (err) {
      debts = oldDebts;
      errorMessage = err;
    }
  };
</script>

<svelte:head>
  <link
    rel="manifest"
    crossorigin="use-credentials"
    href={`/api/utils/manifest.json?path=${manifestUrl}`}
  />
</svelte:head>

<Header company="Ootang" platformName={groupName} />
<Content>
  <Grid>
    {#if errorMessage}
      <Row padding>
        <Column>
          <span class="red">
            Error: {errorMessage}
          </span>
        </Column>
      </Row>
    {/if}
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
                  on:error={(e) => {
                    errorMessage = e.detail;
                  }}
                />
              </div>
            {/each}
          </div>
        </Column>
      </Row>
    {/if}
  </Grid>
</Content>
<Modal
  danger
  bind:open={isDeleteModalOpen}
  modalHeading="Delete card"
  primaryButtonText="Delete"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => {
    isDeleteModalOpen = false;
  }}
  on:submit={() => {
    deleteDebt();
    isDeleteModalOpen = false;
  }}
>
  Are you sure you want to delete {debtToDelete?.description
    ? `"${debtToDelete.description}"`
    : "this card"}?
</Modal>

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

  .red {
    color: var(--cds-danger-01);
  }
</style>
