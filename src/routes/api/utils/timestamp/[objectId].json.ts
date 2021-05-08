import type { RequestHandler } from "@sveltejs/kit";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

export const get: RequestHandler = async (request) => {
  const timestamp = ObjectId(request.params.objectId).getTimestamp();

  return {
    body: timestamp
  };
};
