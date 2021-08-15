<script>
  import "carbon-components-svelte/css/all.css";
</script>

<svelte:head>
  <!-- Primary Meta Tags -->
  <title>Ootang</title>
  <meta name="title" content="Ootang – Keep tabs on borrowed money" />
  <meta
    name="description"
    content="Never forget about the money your friend owes you with Ootang."
  />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ootang.vercel.app/" />
  <meta property="og:title" content="Ootang – Keep tabs on borrowed money" />
  <meta
    property="og:description"
    content="Never forget about the money your friend owes you with Ootang."
  />
  <meta property="og:image:secure_url" content="https://ootang.vercel.app/meta_card.png" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://ootang.vercel.app/" />
  <meta property="twitter:title" content="Ootang – Keep tabs on borrowed money" />
  <meta
    property="twitter:description"
    content="Never forget about the money your friend owes you with Ootang."
  />
  <meta property="twitter:image" content="https://ootang.vercel.app/meta_card.png" />

  <!-- iOS compatibility -->
  <link rel="apple-touch-icon" href="logo512.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</svelte:head>

<slot />
