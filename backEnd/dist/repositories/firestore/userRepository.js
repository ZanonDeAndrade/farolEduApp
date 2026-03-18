"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreUserRepository = void 0;
const firebase_1 = require("../../infra/firebase");
const helpers_1 = require("./helpers");
const USERS_COLLECTION = "users";
const mapUser = (data, id) => ({
    id,
    name: data.name,
    email: data.email,
    password: data.password ?? data.passwordHash ?? "",
    role: data.role,
    photoUrl: data.photoUrl ?? null,
    authProvider: data.authProvider ?? "EMAIL",
    authProviderId: data.authProviderId ?? null,
    providers: data.providers ?? (data.authProvider ? [String(data.authProvider).toLowerCase()] : ["local"]),
    googleUid: data.googleUid ?? data.authProviderId ?? null,
    lastLoginAt: (0, helpers_1.fromTimestamp)(data.lastLoginAt) ?? null,
    createdAt: (0, helpers_1.fromTimestamp)(data.createdAt) ?? new Date(),
    updatedAt: (0, helpers_1.fromTimestamp)(data.updatedAt) ?? new Date(),
});
class FirestoreUserRepository {
    async createUser(data) {
        const normalizedEmail = data.email.toLowerCase();
        const existing = await (0, helpers_1.getCollection)(USERS_COLLECTION)
            .where("email", "==", normalizedEmail)
            .limit(1)
            .get();
        if (!existing.empty) {
            const err = new Error("EMAIL_ALREADY_EXISTS");
            err.code = "P2002";
            throw err;
        }
        const now = new Date();
        const id = await (0, helpers_1.getNextId)(USERS_COLLECTION);
        const payload = {
            id,
            name: data.name,
            email: normalizedEmail,
            password: data.password,
            role: data.role,
            photoUrl: null,
            authProvider: "EMAIL",
            authProviderId: null,
            providers: ["local"],
            googleUid: null,
            lastLoginAt: null,
            createdAt: now,
            updatedAt: now,
        };
        await firebase_1.firestore.collection(USERS_COLLECTION).doc(String(id)).set(payload);
        return mapUser(payload, id);
    }
    async findUserByEmail(email) {
        const snap = await (0, helpers_1.getCollection)(USERS_COLLECTION).where("email", "==", email.toLowerCase()).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        return mapUser(doc.data(), Number(doc.id));
    }
    async findUserById(id) {
        const doc = await (0, helpers_1.getCollection)(USERS_COLLECTION).doc(String(id)).get();
        if (!doc.exists)
            return null;
        return mapUser(doc.data(), Number(doc.id));
    }
    async getAllStudents() {
        const snap = await (0, helpers_1.getCollection)(USERS_COLLECTION).where("role", "==", "student").get();
        return snap.docs.map(doc => mapUser(doc.data(), Number(doc.id)));
    }
    async createFromGoogle(data) {
        const normalizedEmail = data.email.toLowerCase();
        const existing = await (0, helpers_1.getCollection)(USERS_COLLECTION)
            .where("email", "==", normalizedEmail)
            .limit(1)
            .get();
        if (!existing.empty) {
            return mapUser(existing.docs[0].data(), Number(existing.docs[0].id));
        }
        const now = new Date();
        const id = await (0, helpers_1.getNextId)(USERS_COLLECTION);
        const payload = {
            id,
            name: data.name,
            email: normalizedEmail,
            password: "",
            role: data.role,
            photoUrl: null,
            authProvider: "GOOGLE",
            authProviderId: data.googleUid,
            googleUid: data.googleUid,
            providers: ["google"],
            lastLoginAt: now,
            createdAt: now,
            updatedAt: now,
        };
        await firebase_1.firestore.collection(USERS_COLLECTION).doc(String(id)).set(payload);
        return mapUser(payload, id);
    }
    async linkGoogleAccount(userId, googleUid) {
        const docRef = firebase_1.firestore.collection(USERS_COLLECTION).doc(String(userId));
        await firebase_1.firestore.runTransaction(async (tx) => {
            const snap = await tx.get(docRef);
            if (!snap.exists)
                return;
            const data = snap.data() || {};
            const providers = Array.isArray(data.providers) ? data.providers : [];
            const mergedProviders = Array.from(new Set([...providers, "google"]));
            tx.update(docRef, {
                googleUid,
                authProviderId: data.authProviderId ?? googleUid,
                providers: mergedProviders,
                updatedAt: new Date(),
            });
        });
    }
    async updateLastLogin(userId) {
        const docRef = firebase_1.firestore.collection(USERS_COLLECTION).doc(String(userId));
        await docRef.update({
            lastLoginAt: new Date(),
            updatedAt: new Date(),
        });
    }
    async updateUserPhoto(userId, photoUrl) {
        if (!Number.isFinite(userId)) {
            throw new Error("INVALID_USER_ID");
        }
        const docRef = firebase_1.firestore.collection(USERS_COLLECTION).doc(String(userId));
        const snap = await docRef.get();
        if (!snap.exists)
            return null;
        const updatedAt = new Date();
        await docRef.update({
            photoUrl,
            updatedAt,
        });
        const data = snap.data() || {};
        return mapUser({
            ...data,
            photoUrl,
            updatedAt,
        }, Number(snap.id));
    }
}
exports.FirestoreUserRepository = FirestoreUserRepository;
