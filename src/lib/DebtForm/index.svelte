<script lang="ts">
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

  type User = {
    id: string;
    text: string;
  };

  export let users: User[];
  export let userFrom: string;
  export let userTo: string;

  $: isFromAndToSame = userFrom === userTo;

  let userFromIndex = 0;
  let userToIndex = 1;

  $: {
    userFrom = users[userFromIndex].id;
    userTo = users[userToIndex].id;
  }

  let moneyOwedValue = 0;

  $: moneyOwedString = isFromAndToSame
    ? ""
    : `${users[userFrom].text}` +
      " will owe " +
      `${users[userTo].text}` +
      " " +
      `₱${moneyOwedValue.toFixed(2)}`;

  let description = "";

  const clearForm = () => {
    moneyOwedValue = 0;
    description = "";
  };

  // FIXME: Cache newly added entry, there's no need to
  //        refetch from the database.
  const handleOnSubmit = async (e) => {
    e.preventDefault();

    e.detail = {
      from: userFrom,
      to: userTo,
      amount: moneyOwedValue,
      description: description,
      is_paid: false
    };

    const res = await fetch(`/api/debt.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e.detail)
    }).then(() => {
      clearForm();
    });
  };
</script>

<Form on:submit={handleOnSubmit} on:submit>
  <Row>
    <Column md={4}>
      <FormGroup>
        <Dropdown id="from" titleText="From" bind:selectedIndex={userFromIndex} items={users} />
      </FormGroup>
    </Column>
    <Column md={4}>
      <FormGroup>
        <Dropdown
          id="to"
          titleText="To"
          bind:selectedIndex={userToIndex}
          items={users}
          invalid={isFromAndToSame}
          invalidText="You can't owe yourself!"
        />
      </FormGroup>
    </Column>
  </Row>
  <Row>
    <Column sm={4} md={2}>
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
    <Column sm={4} md={6}>
      <TextInput
        id="description"
        labelText="Description"
        placeholder="What's the money for?"
        bind:value={description}
        disabled={isFromAndToSame}
        warn={description === ""}
        warnText="The description is empty."
      />
    </Column>
  </Row>
  <Row padding>
    <Column style="text-align: right;">
      <Button type="submit" disabled={isFromAndToSame}>Add</Button>
    </Column>
  </Row>
</Form>
