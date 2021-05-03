import type { RequestHandler } from "@sveltejs/kit";

import { updateDebt, deleteDebt } from "$lib/database";

export const patch: RequestHandler = async (request) => {
  const { id } = request.params;
  let isPaid = false;
  if (request.query.has("is_paid")) {
    isPaid = true;
  }

  await updateDebt(id, isPaid);

  return {
    status: 200,
    body: ""
  };
};

export const del: RequestHandler = async (request) => {
  const { id } = request.params;
  await deleteDebt(id);

  return {
    status: 200,
    body: ""
  };
};
