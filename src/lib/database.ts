import mongodb from "mongodb";
const { MongoClient, ObjectId } = mongodb;

export type User = {
  _id: typeof ObjectId;
  name: string;
};

export type DebtWithId = {
  _id: typeof ObjectId;
  debtor_id: typeof ObjectId;
  debtee_id: typeof ObjectId;
  amount: number;
  description: string;
  is_paid: boolean;
};

export type Debt = {
  debtor_id: typeof ObjectId;
  debtee_id: typeof ObjectId;
  amount: number;
  description: string;
  is_paid: boolean;
};

let cachedDb = null;

async function getDb() {
  const uri = import.meta.env.VITE_MONGODB_URI;

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

export async function getUsers(): Promise<User[]> {
  const db = await getDb();
  return await db.collection("users").find().toArray();
}

export async function getDebtsOfUser(userId: string): Promise<DebtWithId[]> {
  const db = await getDb();
  const debts: DebtWithId[] = await db
    .collection("debts")
    .find({
      $or: [
        {
          debtor_id: ObjectId(userId)
        },
        {
          debtee_id: ObjectId(userId)
        }
      ]
    })
    .toArray();

  return debts;
}

export async function addDebt(data: Debt): Promise<void> {
  data.debtor_id = ObjectId(data.debtor_id);
  data.debtee_id = ObjectId(data.debtee_id);

  const db = await getDb();
  await db.collection("debts").insertOne(data);
}

export async function updateDebt(debtId: string, isPaid: boolean): Promise<void> {
  const db = await getDb();

  const filter = { _id: ObjectId(debtId) };

  await db.collection("debts").updateOne(filter, {
    $set: {
      is_paid: isPaid
    }
  });
}

export async function deleteDebt(debtId: string): Promise<void> {
  const db = await getDb();
  await db.collection("debts").deleteOne({ _id: ObjectId(debtId) });
}
