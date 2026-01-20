import { firestore } from "../../infra/firebase";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

export const fromTimestamp = (value: FirebaseFirestore.Timestamp | Date | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return null;
};

export const getCollection = (path: string) => firestore.collection(path);

export const getNextId = async (key: string): Promise<number> => {
  const docRef = firestore.collection("counters").doc(key);
  const result = await firestore.runTransaction(async tx => {
    const snap = await tx.get(docRef);
    const current = snap.exists ? (snap.data()?.current as number) || 0 : 0;
    const next = current + 1;
    tx.set(docRef, { current: next });
    return next;
  });
  return result;
};

export const ensureDate = (value: any) => {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};
