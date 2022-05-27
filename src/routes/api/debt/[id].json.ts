import type { ResponseBody } from "@sveltejs/kit";
import type { RequestHandler } from "./__types/[id].json";

import { updateDebt, deleteDebt } from "$lib/database";

type PatchOutput = ResponseBody & {
  error?: string;
};
export const patch: RequestHandler<PatchOutput> = async ({ params, url }) => {
  const { id } = params;

  const isPaidParam = (): boolean => {
    const isPaidParamString = url.searchParams.get("is_paid");

    if (isPaidParamString === "true") {
      return true;
    } else if (isPaidParamString === "false") {
      return false;
    } else {
      throw new Error(`is_paid must be 'true' or 'false'. Passed value: '${isPaidParamString}'`);
    }
  };

  try {
    await updateDebt(id, isPaidParam());

    return {
      status: 200,
      body: ""
    };
  } catch (error) {
    return {
      status: 400,
      body: { error: `${error}` }
    };
  }
};

export const del: RequestHandler = async ({ params }) => {
  const { id } = params;
  await deleteDebt(id);

  return {
    status: 200,
    body: ""
  };
};
