import type { RequestHandler } from "@sveltejs/kit";
import { getUsersAndDebtsOfGroup } from "$lib/database";

export const get: RequestHandler = async (request) => {
  const { groupId } = request.params;
  const result = await getUsersAndDebtsOfGroup(groupId);

  return {
    status: 200,
    body: result
  };
};
