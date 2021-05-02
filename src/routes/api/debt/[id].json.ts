import type { RequestHandler } from "@sveltejs/kit";

import { updateDebt } from "$lib/database";

export const patch: RequestHandler = async (request) => {
  const { id } = request.params;
  let is_paid = false;
  if (request.query.has("is_paid")) {
    is_paid = true;
  }

  updateDebt(id, is_paid);

  return {
    status: 200,
    body: ""
  };
};
