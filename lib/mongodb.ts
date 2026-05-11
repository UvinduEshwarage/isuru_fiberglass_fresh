import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URL!;
const dbName = process.env.MONGODB_DB!;

if (!uri) {
  throw new Error("Please define MONGODB_URI in .env");
}

if (!dbName) {
  throw new Error("Please define MONGODB_DB in .env");
}


let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
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