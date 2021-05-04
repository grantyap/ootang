import type { RequestHandler } from "@sveltejs/kit";
import { ObjectId } from "mongodb";

export const get: RequestHandler = async () => {
  return {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: {
      id: new ObjectId()
    }
  };
};
