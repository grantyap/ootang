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
          initialUsers: group.users,
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
  import {
    Header,
    HeaderUtilities,
    HeaderGlobalAction,
    Content,
    Grid,
    Row,
    Column,
    Modal,
    Dropdown
  } from "carbon-components-svelte";
  import { Add20 } from "carbon-icons-svelte";
  import VirtualList from "@sveltejs/svelte-virtual-list";
  import DebtFormModal from "$lib/DebtFormModal/index.svelte";
  import DebtTile from "$lib/DebtTile/index.svelte";
  import AmountOwed from "$lib/AmountOwed/index.svelte";
  import { users, currentUser, userDropdownItems } from "$lib/stores";
  import type { DebtWithId } from "$lib/database";

  export let groupName: string;
  export let initialUsers: User[];
  export let debts: DebtWithId[] = [];
  export let manifestUrl: string;

  let isDebtFormOpen = false;
  let isDeleteModalOpen = false;
  let debtToDelete: DebtWithId | null = null;

  $users = initialUsers;
  $currentUser = $users[0];

  $: selectedUserIndex = $userDropdownItems.findIndex((user) => user.id === $currentUser._id);

  $: debtsOfCurrentUser = debts.filter(
    (d) => d.debtor_id === $currentUser._id || d.debtee_id === $currentUser._id
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
    isDeleteModalOpen = true;
    debtToDelete = e.detail;
  };

  const deleteDebt = () => {
    debts = debts.filter((d) => d._id !== debtToDelete._id);

    const url = `/api/debt/${debtToDelete._id}.json`;
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

<svelte:head>
  <link
    rel="manifest"
    crossorigin="use-credentials"
    href={`/api/utils/manifest.json?path=${manifestUrl}`}
  />
</svelte:head>

<Header company="Ootang" platformName={groupName}>
  <HeaderUtilities>
    <HeaderGlobalAction
      icon={Add20}
      on:click={() => {
        isDebtFormOpen = !isDebtFormOpen;
      }}
    />
  </HeaderUtilities>
</Header>
<Content>
  <Grid>
    <Row padding>
      <Column md={2}>
        <Dropdown
          titleText="User"
          bind:selectedIndex={selectedUserIndex}
          items={$userDropdownItems}
          on:select={(e) => {
            $currentUser = $users.find((user) => user._id === e.detail.selectedId);
          }}
        />
      </Column>
      <Column>
        <AmountOwed {debts} on:allDebtsPaid={handleAllDebtsPaid} />
      </Column>
    </Row>
    {#if debtsOfCurrentUser.length === 0}
      <Row padding>
        <Column>
          <p>Nothing to pay ✨</p>
        </Column>
      </Row>
    {:else}
      <Row padding style="flex: 1;">
        <Column style="flex: 1;">
          <VirtualList items={debtsOfCurrentUser} let:item={debt}>
            <DebtTile
              {debt}
              userFrom={$users.find((u) => u._id === debt.debtor_id)}
              userTo={$users.find((u) => u._id === debt.debtee_id)}
              on:debtDelete={handleDebtDelete}
            />
            <div class="mb-4" />
          </VirtualList>
        </Column>
      </Row>
    {/if}
  </Grid>
</Content>
<DebtFormModal bind:open={isDebtFormOpen} on:debtCreate={handleDebtCreate} />
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
  .mb-4 {
    margin-bottom: 1rem;
  }
</style>
