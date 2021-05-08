import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export const get: RequestHandler = async (request) => {
  const timestamp = ObjectId(request.params.objectId).getTimestamp();

  return {
    body: timestamp
  };
};
