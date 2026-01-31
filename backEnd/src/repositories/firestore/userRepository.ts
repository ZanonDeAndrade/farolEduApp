import { IUserRepository } from "../userRepository";
import { User } from "../models";
import { firestore } from "../../infra/firebase";
import { getCollection, getNextId, fromTimestamp } from "./helpers";

const USERS_COLLECTION = "users";

const mapUser = (data: FirebaseFirestore.DocumentData, id: number): User => ({
  id,
  name: data.name,
  email: data.email,
  password: data.password ?? data.passwordHash ?? "",
  role: data.role,
  authProvider: data.authProvider ?? "EMAIL",
  authProviderId: data.authProviderId ?? null,
  providers: data.providers ?? (data.authProvider ? [String(data.authProvider).toLowerCase()] : ["local"]),
  googleUid: data.googleUid ?? data.authProviderId ?? null,
  lastLoginAt: fromTimestamp(data.lastLoginAt) ?? null,
  createdAt: fromTimestamp(data.createdAt) ?? new Date(),
  updatedAt: fromTimestamp(data.updatedAt) ?? new Date(),
});

export class FirestoreUserRepository implements IUserRepository {
  async createUser(data: { name: string; email: string; password: string; role: string }): Promise<User> {
    const normalizedEmail = data.email.toLowerCase();
    const existing = await getCollection(USERS_COLLECTION)
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();
    if (!existing.empty) {
      const err = new Error("EMAIL_ALREADY_EXISTS");
      (err as any).code = "P2002";
      throw err;
    }

    const now = new Date();
    const id = await getNextId(USERS_COLLECTION);
    const payload = {
      id,
      name: data.name,
      email: normalizedEmail,
      password: data.password,
      role: data.role,
      authProvider: "EMAIL",
      authProviderId: null,
      providers: ["local"],
      googleUid: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await firestore.collection(USERS_COLLECTION).doc(String(id)).set(payload);
    return mapUser(payload, id);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const snap = await getCollection(USERS_COLLECTION).where("email", "==", email.toLowerCase()).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return mapUser(doc.data(), Number(doc.id));
  }

  async findUserById(id: number): Promise<User | null> {
    const doc = await getCollection(USERS_COLLECTION).doc(String(id)).get();
    if (!doc.exists) return null;
    return mapUser(doc.data()!, Number(doc.id));
  }

  async getAllStudents(): Promise<User[]> {
    const snap = await getCollection(USERS_COLLECTION).where("role", "==", "student").get();
    return snap.docs.map(doc => mapUser(doc.data(), Number(doc.id)));
  }

  async createFromGoogle(data: { name: string; email: string; googleUid: string; role: string }): Promise<User> {
    const normalizedEmail = data.email.toLowerCase();
    const existing = await getCollection(USERS_COLLECTION)
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();
    if (!existing.empty) {
      return mapUser(existing.docs[0].data(), Number(existing.docs[0].id));
    }

    const now = new Date();
    const id = await getNextId(USERS_COLLECTION);
    const payload = {
      id,
      name: data.name,
      email: normalizedEmail,
      password: "",
      role: data.role,
      authProvider: "GOOGLE",
      authProviderId: data.googleUid,
      googleUid: data.googleUid,
      providers: ["google"],
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await firestore.collection(USERS_COLLECTION).doc(String(id)).set(payload);
    return mapUser(payload, id);
  }

  async linkGoogleAccount(userId: number, googleUid: string): Promise<void> {
    const docRef = firestore.collection(USERS_COLLECTION).doc(String(userId));
    await firestore.runTransaction(async tx => {
      const snap = await tx.get(docRef);
      if (!snap.exists) return;
      const data = snap.data() || {};
      const providers: string[] = Array.isArray(data.providers) ? data.providers : [];
      const mergedProviders = Array.from(new Set([...providers, "google"]));
      tx.update(docRef, {
        googleUid,
        authProviderId: data.authProviderId ?? googleUid,
        providers: mergedProviders,
        updatedAt: new Date(),
      });
    });
  }

  async updateLastLogin(userId: number): Promise<void> {
    const docRef = firestore.collection(USERS_COLLECTION).doc(String(userId));
    await docRef.update({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
