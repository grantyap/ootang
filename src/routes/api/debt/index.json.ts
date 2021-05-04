import type { RequestHandler } from "@sveltejs/kit";
import type { DebtWithId } from "$lib/database";

import { getDebtsOfUser, addDebt } from "$lib/database";

export const get: RequestHandler = async (request) => {
  const query = request.query;
  const debts = await getDebtsOfUser(query.get("user"));

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
