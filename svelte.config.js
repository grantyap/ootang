import preprocess from "svelte-preprocess";
import { optimizeImports, optimizeCss } from "carbon-preprocess-svelte";
import vercel from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [preprocess(), optimizeImports()],

  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    adapter: vercel(),
    vite: {
      plugins: [process.env.NODE_ENV === "production" && optimizeCss()]
    }
  }
};

export default config;
