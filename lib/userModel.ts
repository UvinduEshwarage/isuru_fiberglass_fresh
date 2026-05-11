import { Db, Collection, ObjectId } from "mongodb";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  role: string;
  createdAt: string;
}

export function userCollection(db: Db): Collection<UserDocument> {
  return db.collection<UserDocument>("users");
}

export function hashPassword(password: string, salt?: string) {
  const actualSalt = salt ?? randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, actualSalt, 64).toString("hex");
  return { salt: actualSalt, passwordHash: derivedKey };
}

export function verifyPassword(password: string, user: UserDocument): boolean {
  const derived = scryptSync(password, user.salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(user.passwordHash, "hex"), Buffer.from(derived, "hex"));
}

export async function findUserByEmail(db: Db, email: string) {
  return userCollection(db).findOne({ email });
}

export async function createUser(db: Db, user: Omit<UserDocument, "_id" | "createdAt">) {
  return userCollection(db).insertOne({ ...user, createdAt: new Date().toISOString() });
}

export async function ensureUserIndexes(db: Db): Promise<void> {
  await userCollection(db).createIndex({ email: 1 }, { unique: true });
}