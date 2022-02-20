<script lang="ts">
  import { browser } from "$app/env";
  import { createEventDispatcher } from "svelte";
  import {
    Row,
    Column,
    NumberInput,
    TextInput,
    Form,
    FormGroup,
    Dropdown,
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter
  } from "carbon-components-svelte";
  import type { DebtWithId } from "$lib/database";
  import ObjectID from "bson-objectid";
  import { users, currentUser, userDropdownItems } from "$lib/stores";

  const dispatch = createEventDispatcher<{ debtCreate: DebtWithId }>();

  export let open: boolean = true;

  let userFromIndex = $userDropdownItems.findIndex((user) => user.id === $currentUser._id);
  let userToIndex = 1;

  $: $currentUser = $users.find((user) => user._id === $userDropdownItems[userFromIndex].id);

  $: isFromAndToSame = userFromIndex === userToIndex;

  let moneyOwedValue = 0;

  $: moneyOwedString = isFromAndToSame
    ? ""
    : `${$users[userFromIndex].name}` +
      " will owe " +
      `${$users[userToIndex].name}` +
      " " +
      `₱${moneyOwedValue.toFixed(2)}`;

  let description = "";

  const clearForm = () => {
    moneyOwedValue = 0;
    description = "";
  };

  const notifyDebtCreate = (debt: DebtWithId) => {
    dispatch("debtCreate", debt);
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    const newDebt = {
      _id: new ObjectID().toHexString(),
      debtor_id: $users[userFromIndex]._id,
      debtee_id: $users[userToIndex]._id,
      amount: moneyOwedValue,
      description: description,
      is_paid: false
    };

    notifyDebtCreate(newDebt);
    clearForm();
  };
</script>

{#if browser}
  <ComposedModal size="lg" bind:open>
    <ModalHeader title="Create debt" />
    <ModalBody hasForm hasScrollingContent>
      <Form on:submit={handleOnSubmit} on:submit>
        <Row>
          <Column md={4}>
            <FormGroup>
              <Dropdown
                id="from"
                titleText="From"
                bind:selectedIndex={userFromIndex}
                items={$userDropdownItems}
              />
            </FormGroup>
          </Column>
          <Column md={4}>
            <FormGroup>
              <Dropdown
                id="to"
                titleText="To"
                bind:selectedIndex={userToIndex}
                items={$userDropdownItems}
                invalid={isFromAndToSame}
                invalidText="You can't owe yourself!"
              />
            </FormGroup>
          </Column>
        </Row>
        <Row>
          <Column sm={4} md={3}>
            <NumberInput
              id="amount"
              label="Amount owed"
              helperText={moneyOwedString}
              bind:value={moneyOwedValue}
              disabled={isFromAndToSame}
              min={0}
              step={0.01}
            />
          </Column>
          <Column sm={4} md={5}>
            <TextInput
              id="description"
              labelText="Description"
              placeholder="What's the money for?"
              bind:value={description}
              disabled={isFromAndToSame}
              warn={description === ""}
              warnText="The description is empty."
              maxlength={64}
            />
          </Column>
        </Row>
      </Form>
    </ModalBody>
    <ModalFooter primaryButtonText="Create" primaryButtonDisabled={isFromAndToSame} />
  </ComposedModal>
{/if}
