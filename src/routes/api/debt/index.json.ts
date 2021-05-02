import type { RequestHandler } from "@sveltejs/kit";
import type { Data } from "$lib/database";

import { addDebt } from "$lib/database";

export const post: RequestHandler = async (request) => {
  const data = request.body.valueOf() as Data;
  console.debug(`[/api/debt/index.ts] ${JSON.stringify(data)}`);
  addDebt(data);

  return {
    status: 200,
    body: ""
  };
};
