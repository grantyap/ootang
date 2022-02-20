import { derived, writable } from "svelte/store";
import type { DropdownItem } from "carbon-components-svelte/types/Dropdown/Dropdown";
import type { User } from "$lib/database";
import type { ObjectId } from "mongodb";

export const users = writable<User[]>([]);
export const currentUser = writable<User | null>();
export const userDropdownItems = derived<typeof users, DropdownItem[]>(users, ($users) =>
  $users.map((user): DropdownItem => {
    let item: Partial<DropdownItem> = {
      text: user.name
    };

    if (typeof user._id === "string") {
      item = { ...item, id: user._id };
    } else {
      item = { ...item, id: user._id.toHexString() };
    }

    return item as Required<DropdownItem>;
  })
);
