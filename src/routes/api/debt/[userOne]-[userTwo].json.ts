import type { RequestHandler } from "@sveltejs/kit";

import { getDebtsOfUsers } from "$lib/database";

export const get: RequestHandler = async (request) => {
  const { userOne, userTwo } = request.params;
  const debts = getDebtsOfUsers(userOne, userTwo);
  console.debug("debts:");
  console.debug(debts);

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(debts)
  };
};
