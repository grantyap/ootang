import type { RequestHandler } from "@sveltejs/kit";

import { updateDebt, deleteDebt } from "$lib/database";

export const patch: RequestHandler = async (request) => {
  const { id } = request.params;
  const isPaidParam = request.query.get("is_paid");
  if (isPaidParam) {
    if (isPaidParam === "1") {
      await updateDebt(id, true);
    } else if (isPaidParam === "0") {
      await updateDebt(id, false);
    }
  }

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
