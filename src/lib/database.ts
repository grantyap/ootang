import { MongoClient } from "mongodb";

export type DebtWithId = {
  _id: string;
  debtor_id: string;
  debtee_id: string;
  amount: number;
  description: string;
  is_paid: boolean;
};

export type Debt = {
  debtor_id: string;
  debtee_id: string;
  amount: number;
  description: string;
  is_paid: boolean;
};

let cachedDb = null;

async function getDb() {
  const uri = process.env.MONGODB_URI;

  if (cachedDb) {
    return cachedDb;
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = await client.db("ootang");

  cachedDb = db;
  return db;
}

export async function getDebtsOfUser(userId: string): Promise<DebtWithId[]> {
  const db = await getDb();
  const debts: DebtWithId[] = await db
    .collection("debts")
    .find({
      $or: [
        {
          debtor_id: userId
        },
        {
          debtee_id: userId
        }
      ]
    })
    .toArray();

  return debts;
}

export async function addDebt(data: Debt): Promise<void> {
  const db = await getDb();
  await db.collection("debts").insertOne(data);
}

export async function updateDebt(debtId: string, isPaid: boolean): Promise<void> {
  const db = await getDb();

  const filter = { _id: debtId };

  await db.collection("debts").update(filter, {
    $set: {
      is_paid: isPaid
    }
  });
}

export async function deleteDebt(debtId: string): Promise<void> {
  const db = await getDb();
  await db.collection("debts").deleteOne({ _id: debtId });
}
