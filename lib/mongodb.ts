import { MongoClient, Db } from "mongodb";

let client: MongoClient | undefined;
let db: Db | undefined;

export async function connectDB(): Promise<Db> {
  const uri = process.env.MONGODB_URL || process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || process.env.MONGODB_NAME;

  if (!uri) {
    throw new Error(
      "Please define MONGODB_URL (or MONGODB_URI) in environment",
    );
  }

  if (!dbName) {
    throw new Error(
      "Please define MONGODB_DB (or MONGODB_NAME) in environment",
    );
  }

  if (db) {
    console.log("mongodb connected (reusing existing connection)");
    return db;
  }

  console.log("Attempting to connect to MongoDB...");
  client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  console.log("mongodb connected successfully!");
  return db;
}
