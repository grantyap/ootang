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

export type DataWithId = {
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

export function getDebtsOfUser(userId: string): DataWithId[] {
  const results = db.get("debts").filter((entry: DataWithId) => {
    if (entry.from === userId || entry.to === userId) {
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

export function updateDebt(id: string, is_paid: boolean): void {
  db.get("debts")
    .find({ id: id })
    .assign({ is_paid: is_paid })
    .write();
}
