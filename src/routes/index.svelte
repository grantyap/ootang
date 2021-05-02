<script lang="ts">
  import {
    Header,
    Content,
    Grid,
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

  let fromSelectedId = "0";
  let toSelectedId = "1";

  $: isFromAndToSame = fromSelectedId === toSelectedId;

  let moneyOwedValue = 0;

  $: moneyOwedString = isFromAndToSame
    ? ""
    : `${people[fromSelectedId].text}` +
      " will owe " +
      `${people[toSelectedId].text}` +
      " " +
      `₱${moneyOwedValue.toFixed(2)}`;

  let description = "";
</script>

<Header company="Ootang" platformName="IOU Tracker" />

<Content>
  <Grid>
    <Form
      on:submit={() => {
        const entry = {
          from: fromSelectedId,
          to: toSelectedId,
          amount: moneyOwedValue,
          description: description
        };
        
        console.debug(entry);
      }}
    >
      <Row>
        <Column md={4}>
          <FormGroup>
            <Select
              id="from"
              labelText="From"
              value={people[0].text}
              bind:selected={fromSelectedId}
            >
              {#each people as person (person.id)}
                <SelectItem value={person.id} text={person.text} />
              {/each}
            </Select>
          </FormGroup>
        </Column>
        <Column md={4}>
          <FormGroup>
            <Select
              id="to"
              labelText="To"
              value={people[1].text}
              bind:selected={toSelectedId}
              invalid={isFromAndToSame}
              invalidText="You can't owe yourself!"
            >
              {#each people as person (person.id)}
                <SelectItem value={person.id} text={person.text} />
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
    <Row padding>
      <Column>
        <code>fromSelected: {fromSelectedId}, type {typeof fromSelectedId}</code><br />
        <code>toSelected: {toSelectedId}, type {typeof toSelectedId}</code>
      </Column>
    </Row>
  </Grid>
</Content>
