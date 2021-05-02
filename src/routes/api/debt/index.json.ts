import type { RequestHandler } from "@sveltejs/kit";
import type { Data } from "$lib/database";

import { getDebtsOfUsers, addDebt } from "$lib/database";

export const get: RequestHandler = async (request) => {
  const query = request.query;
  const debts = getDebtsOfUsers(query.get("user1"), query.get("user2"));

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: debts
  };
};

export const post: RequestHandler = async (request) => {
  const data = request.body.valueOf() as Data;
  addDebt(data);

  return {
    status: 200,
    body: ""
  };
};
