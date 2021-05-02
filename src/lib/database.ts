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

db.defaults({
  debts: [],
  count: 0
}).write();

export function getDebtsOfUsers(userOneId: string, userTwoId: string): void {
  const results = db.get("debts").find({ from: userOneId, to: userTwoId }).value();
  return results;
}

export function addDebt(data: Data): void {
  const lastCount = db.get("count").value();
  db.get("debts")
    .push({ id: String(lastCount), ...data })
    .write();
  db.set("count", lastCount + 1).write();
}
