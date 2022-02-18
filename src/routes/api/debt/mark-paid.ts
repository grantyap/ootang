import type { RequestHandler } from "@sveltejs/kit";
import { markDebtsAsPaid } from "$lib/database";

export const patch: RequestHandler = async ({ url }) => {
  const debtIds = Object.keys(Object.fromEntries(url.searchParams));

  await markDebtsAsPaid(debtIds);

  return {
    body: ""
  };
};
