// import { Db, Collection, ObjectId } from "mongodb";
// import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// export interface UserDocument {
//   _id?: ObjectId;
//   email: string;
//   passwordHash: string;
//   salt: string;
//   name: string;
//   role: string;
//   createdAt: string;
// }

// export function userCollection(db: Db): Collection<UserDocument> {
//   return db.collection<UserDocument>("users");
// }

// export function hashPassword(password: string, salt?: string) {
//   const actualSalt = salt ?? randomBytes(16).toString("hex");
//   const derivedKey = scryptSync(password, actualSalt, 64).toString("hex");
//   return { salt: actualSalt, passwordHash: derivedKey };
// }

// export function verifyPassword(password: string, user: UserDocument): boolean {
//   const derived = scryptSync(password, user.salt, 64).toString("hex");
//   return timingSafeEqual(Buffer.from(user.passwordHash, "hex"), Buffer.from(derived, "hex"));
// }

// export async function findUserByEmail(db: Db, email: string) {
//   return userCollection(db).findOne({ email });
// }

// export async function createUser(db: Db, user: Omit<UserDocument, "_id" | "createdAt">) {
//   return userCollection(db).insertOne({ ...user, createdAt: new Date().toISOString() });
// }

// export async function ensureUserIndexes(db: Db): Promise<void> {
//   await userCollection(db).createIndex({ email: 1 }, { unique: true });
// }
import { Db, Collection, ObjectId } from "mongodb";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export interface UserDocument {
  _id?: ObjectId;

  // Authentication
  email: string;
  passwordHash: string;
  salt: string;

  // Profile
  name: string;
  phone?: string;

  // Authorization
  role: string;

  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

export function userCollection(db: Db): Collection<UserDocument> {
  return db.collection<UserDocument>("users");
}

// =========================
// Password Functions
// =========================

export function hashPassword(password: string, salt?: string) {
  const actualSalt = salt ?? randomBytes(16).toString("hex");

  const derivedKey = scryptSync(password, actualSalt, 64).toString("hex");

  return {
    salt: actualSalt,
    passwordHash: derivedKey,
  };
}

export function verifyPassword(password: string, user: UserDocument): boolean {
  const derived = scryptSync(password, user.salt, 64).toString("hex");

  return timingSafeEqual(
    Buffer.from(user.passwordHash, "hex"),
    Buffer.from(derived, "hex"),
  );
}

// =========================
// Queries
// =========================

export async function findUserByEmail(db: Db, email: string) {
  return userCollection(db).findOne({ email });
}

export async function getAdmin(db: Db) {
  return userCollection(db).findOne({
    role: "admin",
  });
}

// =========================
// Create User
// =========================

export async function createUser(
  db: Db,
  user: Omit<UserDocument, "_id" | "createdAt" | "updatedAt">,
) {
  return userCollection(db).insertOne({
    ...user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

// =========================
// Update Profile
// =========================

export async function updateProfile(
  db: Db,
  email: string,
  profile: {
    name: string;
    phone?: string;
  },
) {
  return userCollection(db).updateOne(
    { email },
    {
      $set: {
        name: profile.name,
        phone: profile.phone,
        updatedAt: new Date().toISOString(),
      },
    },
  );
}

// =========================
// Change Password
// =========================

export async function updatePassword(
  db: Db,
  email: string,
  newPassword: string,
) {
  const { passwordHash, salt } = hashPassword(newPassword);

  return userCollection(db).updateOne(
    { email },
    {
      $set: {
        passwordHash,
        salt,
        updatedAt: new Date().toISOString(),
      },
    },
  );
}
//Update account
export async function updateAccount(
  db: Db,
  currentEmail: string,
  data: {
    email: string;
    passwordHash: string;
    salt: string;
  },
) {
  return userCollection(db).updateOne(
    { email: currentEmail },
    {
      $set: {
        email: data.email,
        passwordHash: data.passwordHash,
        salt: data.salt,
        updatedAt: new Date().toISOString(),
      },
    },
  );
}

// =========================
// Indexes
// =========================

export async function ensureUserIndexes(db: Db): Promise<void> {
  await userCollection(db).createIndex({ email: 1 }, { unique: true });
}
