import { Db, Collection, ObjectId } from "mongodb";

export interface ProductDocument {
  _id?: ObjectId;
  productId: string;
  name: string;
  category: string;
  description?: string;
  stock: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function productCollection(db: Db): Collection<ProductDocument> {
  return db.collection<ProductDocument>("products");
}

export async function ensureProductIndexes(db: Db): Promise<void> {
  const collection = productCollection(db);

  await collection.createIndex({ productId: 1 }, { unique: true });
  await collection.createIndex({ name: 1 });
  await collection.createIndex({ category: 1 });
  await collection.createIndex({ stock: 1 });
}
