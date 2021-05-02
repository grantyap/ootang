import { getDebtsOfUsers, addDebt } from "$lib/database";
import type { RequestHandler } from "@sveltejs/kit";
import type { Data } from "$lib/database";

export const get: RequestHandler = async (request) => {
  type Users = {
    userOne: string;
    userTwo: string;
  };
  const { userOne, userTwo } = request.body.valueOf() as Users;
  const debts = getDebtsOfUsers(userOne, userTwo);

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(debts)
  };
};

export const post: RequestHandler = async (request) => {
  const data = request.body.valueOf() as Data;
  console.debug(`[/api/debt/index.ts] ${JSON.stringify(data)}`);
  addDebt(data);

  return {
    status: 200,
    body: ""
  };
};
