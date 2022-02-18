import type { RequestHandler } from "@sveltejs/kit";
import type { DebtWithId } from "$lib/database";

import { getDebtsOfUser, getDebtsOfGroup, addDebt } from "$lib/database";

export const get: RequestHandler = async ({ url }) => {
  let debts;
  if (url.searchParams.get("user")) {
    debts = await getDebtsOfUser(url.searchParams.get("user"));
  } else if (url.searchParams.get("group")) {
    debts = await getDebtsOfGroup(url.searchParams.get("group"));
  } else {
    debts = "";
  }

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: debts
  };
};

export const post: RequestHandler = async ({ request }) => {
  const data = request.body.valueOf() as DebtWithId;
  await addDebt(data);

  return {
    status: 200,
    body: ""
  };
};
