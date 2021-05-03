import type { RequestHandler } from "@sveltejs/kit";
import { getUsers } from "$lib/database";

export const get: RequestHandler = async () => {
  const users = await getUsers();

  return {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(users)
  };
};
