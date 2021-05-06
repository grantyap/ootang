import type { RequestHandler } from "@sveltejs/kit";
import type { DebtWithId } from "$lib/database";

import { getDebtsOfUser, getDebtsOfGroup, addDebt } from "$lib/database";

export const get: RequestHandler = async (request) => {
  let debts;
  if (request.query.get("user")) {
    debts = await getDebtsOfUser(request.query.get("user"));
  } else if (request.query.get("group")) {
    debts = await getDebtsOfGroup(request.query.get("group"));
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

export const post: RequestHandler = async (request) => {
  const data = request.body.valueOf() as DebtWithId;
  await addDebt(data);

  return {
    status: 200,
    body: ""
  };
};
