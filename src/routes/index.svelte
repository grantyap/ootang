<script lang="ts">
  import { onDestroy } from "svelte";
  import { Header, Content, Grid, Row, Column } from "carbon-components-svelte";

  const generateRandomGroupId = () => {
    const validChars = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f"
    ];

    let output = "";
    for (let i = 0; i < 24; i++) {
      const randomCharacter = validChars[Math.floor(Math.random() * validChars.length)];
      output += randomCharacter;
    }

    return output;
  };

  const onInterval = (callback, milliseconds) => {
    const interval = setInterval(callback, milliseconds);

    onDestroy(() => {
      clearInterval(interval);
    });
  };

  let randomGroupId = generateRandomGroupId();

  onInterval(() => {
    randomGroupId = generateRandomGroupId();
  }, 1000);
</script>

<Header company="Ootang" platformName="IOU Tracker" />

<Content>
  <Grid>
    <Row padding>
      <Column>
        <h1>Oops!</h1>
      </Column>
    </Row>
    <Row>
      <Column>
        <p>Did you include the group ID in the address bar?</p>
      </Column>
    </Row>
    <Row padding>
      <Column>
        <code class="pink">https://ootang.vercel.app/{randomGroupId}</code>
      </Column>
    </Row>
  </Grid>
</Content>

<style>
  .pink {
    color: rgb(228, 0, 95);
  }
</style>
