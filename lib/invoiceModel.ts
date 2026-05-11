import { Db, Collection, ObjectId } from "mongodb";

export interface InvoiceItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface InvoiceDocument {
  _id?: ObjectId;
  customerName: string;
  items: InvoiceItem[];
  total: number;
  date: string;
  createdAt: string;
  notes?: string;
}

export function invoiceCollection(db: Db): Collection<InvoiceDocument> {
  return db.collection<InvoiceDocument>("invoices");
}

export async function ensureInvoiceIndexes(db: Db): Promise<void> {
  const collection = invoiceCollection(db);
  await collection.createIndex({ customerName: 1 });
  await collection.createIndex({ date: 1 });
}