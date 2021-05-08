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

export type GroupData = {
  _id: typeof ObjectId;
  name: string;
  users: User[];
  debts: DebtWithId[];
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

export async function getUsersAndDebtsOfGroup(groupId: string): Promise<GroupData> {
  // NOTE: On the server side, "service-worker.js" gets passed as
  //       the `groupId` for some reason. Let's just ignore it.
  if (groupId === "service-worker.js") {
    return null;
  }

  const db = await getDb();
  const result = await db
    .collection("groups")
    .aggregate([
      {
        $match: {
          _id: ObjectId(groupId)
        }
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
          _id: ObjectId(groupId)
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
  data._id = ObjectId(data._id);
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

export async function markDebtsAsPaid(debtIds: string[]): Promise<void> {
  debtIds = debtIds.map((d) => ObjectId(d));

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
  await db.collection("debts").deleteOne({ _id: ObjectId(debtId) });
}
