import type { RequestHandler } from "@sveltejs/kit";

import { updateDebt, deleteDebt } from "$lib/database";

export const patch: RequestHandler = async ({ params, url }) => {
  const { id } = params;
  const isPaidParam = url.searchParams.get("is_paid");
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

export const del: RequestHandler = async ({ params }) => {
  const { id } = params;
  await deleteDebt(id);

  return {
    status: 200,
    body: ""
  };
};
