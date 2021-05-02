<script lang="ts">
  import {
    Row,
    Column,
    Button,
    NumberInput,
    TextInput,
    Form,
    FormGroup,
    Select,
    SelectItem
  } from "carbon-components-svelte";

  type User = {
    id: string;
    text: string;
  };

  export let users: User[];
  export let userFrom: string;
  export let userTo: string;

  $: isFromAndToSame = userFrom === userTo;

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

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    const entry = {
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
      body: JSON.stringify(entry)
    }).then(() => {
      clearForm();
    });
  };
</script>

<Form on:submit={handleOnSubmit}>
  <Row>
    <Column md={4}>
      <FormGroup>
        <Select id="from" labelText="From" value={users[0].text} bind:selected={userFrom}>
          {#each users as user (user.id)}
            <SelectItem value={user.id} text={user.text} />
          {/each}
        </Select>
      </FormGroup>
    </Column>
    <Column md={4}>
      <FormGroup>
        <Select
          id="to"
          labelText="To"
          value={users[1].text}
          bind:selected={userTo}
          invalid={isFromAndToSame}
          invalidText="You can't owe yourself!"
        >
          {#each users as user (user.id)}
            <SelectItem value={user.id} text={user.text} />
          {/each}
        </Select>
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
