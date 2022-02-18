import type { RequestHandler } from "@sveltejs/kit";

const manifestWithPath = (path?: string) => {
  return {
    short_name: "Ootang",
    name: "Ootang",
    start_url: `${path ?? "/"}`,
    icons: [
      {
        src: "logo512.png",
        type: "image/png",
        sizes: "512x512"
      },
      {
        src: "logo192.png",
        type: "image/png",
        sizes: "192x192"
      }
    ],
    background_color: "#FFFFFF",
    display: "standalone",
    scope: "/",
    theme_color: "#161616",
    description: "Never forget about the money your friend owes you with Ootang."
  };
};

export const get: RequestHandler = async ({ url }) => {
  const path = url.searchParams.get("path");

  return {
    status: 200,
    body: manifestWithPath(path)
  };
};
