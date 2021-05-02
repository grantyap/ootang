import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

const adapter = new FileSync("db.json");
const db = low(adapter);

export type Data = {
  from: string;
  to: string;
  amount: number;
  description: string;
  is_paid: boolean;
};

type DataWithId = {
  id: string,
  from: string;
  to: string;
  amount: number;
  description: string;
  is_paid: boolean;
};

db.defaults({
  debts: [],
  count: 0
}).write();

export function getDebtsOfUsers(userOneId: string, userTwoId: string): DataWithId[] {
  const results = db.get("debts").filter((entry: DataWithId) => {
    if (entry.from === userOneId && entry.to === userTwoId) {
      return true;
    }
    if (entry.to === userOneId && entry.from === userTwoId) {
      return true;
    }
    return false;
  }).value();
  return results;
}

export function addDebt(data: Data): void {
  const lastCount = db.get("count").value();
  db.get("debts")
    .push({ id: String(lastCount), ...data })
    .write();
  db.set("count", lastCount + 1).write();
}
