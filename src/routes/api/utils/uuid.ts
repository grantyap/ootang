import type { RequestHandler } from "@sveltejs/kit";
import mongodb from "mongodb";

const { ObjectId } = mongodb;

export const get: RequestHandler = async () => {
  return {
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    },
    body: new ObjectId().toHexString()
  };
};
