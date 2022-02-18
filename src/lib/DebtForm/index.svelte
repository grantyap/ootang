<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    Row,
    Column,
    Button,
    NumberInput,
    TextInput,
    Form,
    FormGroup,
    Dropdown
  } from "carbon-components-svelte";
  import type { DropdownItem } from "carbon-components-svelte/types/Dropdown/Dropdown";
  import type { User, DebtWithId } from "$lib/database";

  const dispatch = createEventDispatcher<{ debtCreate: DebtWithId }>();

  export let users: User[];

  let userFromIndex = 0;
  let userToIndex = 1;

  $: isFromAndToSame = userFromIndex === userToIndex;

  let moneyOwedValue = 0;

  $: moneyOwedString = isFromAndToSame
    ? ""
    : `${users[userFromIndex].name}` +
      " will owe " +
      `${users[userToIndex].name}` +
      " " +
      `₱${moneyOwedValue.toFixed(2)}`;

  let description = "";

  $: dropdownItems = users.map((user): DropdownItem => {
    let item: Partial<DropdownItem> = {
      text: user.name
    };

    if (typeof user._id === "string") {
      item = { ...item, id: user._id };
    } else {
      item = { ...item, id: user._id.toHexString() };
    }

    return item as Required<DropdownItem>;
  });

  const clearForm = () => {
    moneyOwedValue = 0;
    description = "";
  };

  const notifyDebtCreate = (debt: DebtWithId) => {
    dispatch("debtCreate", debt);
  };

  // FIXME: Cache newly added entry, there's no need to
  //        refetch from the database.
  const handleOnSubmit = async (e) => {
    e.preventDefault();

    const debtId = await fetch(`/api/utils/uuid`).then(async (res) => {
      return await res.text();
    });

    const newDebt = {
      _id: debtId,
      debtor_id: users[userFromIndex]._id,
      debtee_id: users[userToIndex]._id,
      amount: moneyOwedValue,
      description: description,
      is_paid: false
    };

    notifyDebtCreate(newDebt);
    clearForm();
  };
</script>

<Form on:submit={handleOnSubmit} on:submit>
  <Row>
    <Column md={4}>
      <FormGroup>
        <Dropdown
          id="from"
          titleText="From"
          bind:selectedIndex={userFromIndex}
          items={dropdownItems}
          on:select
        />
      </FormGroup>
    </Column>
    <Column md={4}>
      <FormGroup>
        <Dropdown
          id="to"
          titleText="To"
          bind:selectedIndex={userToIndex}
          items={dropdownItems}
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
  <Row padding>
    <Column style="text-align: right;">
      <Button type="submit" disabled={isFromAndToSame}>Add</Button>
    </Column>
  </Row>
</Form>
