import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

export type User = {
  _id: ObjectId | string;
  name: string;
};

export type Debt = {
  debtor_id: ObjectId | string;
  debtee_id: ObjectId | string;
  amount: number;
  description: string;
  is_paid: boolean;
};

export type DebtWithId = Debt & { _id: ObjectId | string };

export type GroupData = {
  _id: ObjectId | string;
  name: string;
  users: User[];
  debts: DebtWithId[];
};

let cachedDb = null;

async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }

  const { VITE_MONGODB_URI } = import.meta.env;
  if (typeof VITE_MONGODB_URI === "boolean") {
    throw new Error("VITE_MONGODB_URI must be a string.");
  }

  const uri = VITE_MONGODB_URI;

  const client = new MongoClient(uri, {
    serverApi: ServerApiVersion.v1
  });
  await client.connect();
  const db = client.db("ootang");

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
          debtor_id: new ObjectId(userId)
        },
        {
          debtee_id: new ObjectId(userId)
        }
      ]
    })
    .sort({ _id: -1 })
    .toArray();

  return debts;
}

export async function getUsersAndDebtsOfGroup(groupId: string): Promise<GroupData> {
  // NOTE: On the server side, "service-worker.js" gets passed as
  //       the `groupId` for some reason. Let's just ignore it.
  if (groupId === "service-worker.js") {
    return null;
  }

  // Let users access their group by its `short_name`.
  // If not, fall back to the group's ObjectID.
  let groupMatcher: { _id: ObjectId } | { short_name: string };
  try {
    groupMatcher = { _id: new ObjectId(groupId) };
  } catch (err) {
    groupMatcher = { short_name: groupId };
  }

  const db = await getDb();
  const result = await db
    .collection("groups")
    .aggregate([
      {
        $match: groupMatcher
      },
      {
        $lookup: {
          from: "users",
          localField: "user_list",
          foreignField: "_id",
          as: "users"
        }
      },
      {
        $lookup: {
          from: "debts",
          let: {
            user_list: "$user_list"
          },
          pipeline: [
            {
              $sort: {
                _id: -1
              }
            },
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$debtor_id", "$$user_list"]
                    },
                    {
                      $in: ["$debtee_id", "$$user_list"]
                    }
                  ]
                }
              }
            }
          ],
          as: "debts"
        }
      }
    ])
    .toArray();

  return result[0];
}

export async function getDebtsOfGroup(groupId: string): Promise<GroupData> {
  const db = await getDb();
  const result = await db
    .collection("groups")
    .aggregate([
      {
        $match: {
          _id: new ObjectId(groupId)
        }
      },
      {
        $lookup: {
          from: "debts",
          let: {
            user_list: "$user_list"
          },
          pipeline: [
            {
              $sort: {
                _id: -1
              }
            },
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$debtor_id", "$$user_list"]
                    },
                    {
                      $in: ["$debtee_id", "$$user_list"]
                    }
                  ]
                }
              }
            }
          ],
          as: "debts"
        }
      },
      {
        $project: {
          _id: 0,
          debts: 1
        }
      }
    ])
    .toArray();

  return result[0];
}

export async function addDebt(data: DebtWithId): Promise<void> {
  data._id = new ObjectId(data._id);
  data.debtor_id = new ObjectId(data.debtor_id);
  data.debtee_id = new ObjectId(data.debtee_id);

  const db = await getDb();
  await db.collection("debts").insertOne(data);
}

export async function updateDebt(debtId: string, isPaid: boolean): Promise<void> {
  const db = await getDb();

  const filter = { _id: new ObjectId(debtId) };

  await db.collection("debts").updateOne(filter, {
    $set: {
      is_paid: isPaid
    }
  });
}

export async function markDebtsAsPaid(debtIdStrings: string[]): Promise<void> {
  const debtIds = debtIdStrings.map((d) => new ObjectId(d));

  const filter = {
    _id: {
      $in: debtIds
    }
  };
  const updatedDocument = {
    $set: {
      is_paid: true
    }
  };

  const db = await getDb();
  await db.collection("debts").updateMany(filter, updatedDocument);
}

export async function deleteDebt(debtId: string): Promise<void> {
  const db = await getDb();
  await db.collection("debts").deleteOne({ _id: new ObjectId(debtId) });
}
