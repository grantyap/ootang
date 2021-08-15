import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export const get: RequestHandler = async () => {
  return {
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    },
    body: new ObjectId().toHexString()
  };
};
