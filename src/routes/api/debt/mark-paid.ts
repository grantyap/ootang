import type { RequestHandler } from "@sveltejs/kit";
import { markDebtsAsPaid } from "$lib/database";

export const patch: RequestHandler = async (request) => {
  const debtIds = Object.keys(Object.fromEntries(request.query));

  await markDebtsAsPaid(debtIds);

  return {
    body: ""
  };
};
