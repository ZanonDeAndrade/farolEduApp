"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDate = exports.getNextId = exports.getCollection = exports.fromTimestamp = void 0;
const firebase_1 = require("../../infra/firebase");
const firestore_1 = require("firebase-admin/firestore");
const fromTimestamp = (value) => {
    if (!value)
        return null;
    if (value instanceof Date)
        return value;
    if (value instanceof firestore_1.Timestamp)
        return value.toDate();
    return null;
};
exports.fromTimestamp = fromTimestamp;
const getCollection = (path) => firebase_1.firestore.collection(path);
exports.getCollection = getCollection;
const getNextId = async (key) => {
    const docRef = firebase_1.firestore.collection("counters").doc(key);
    const result = await firebase_1.firestore.runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        const current = snap.exists ? snap.data()?.current || 0 : 0;
        const next = current + 1;
        tx.set(docRef, { current: next });
        return next;
    });
    return result;
};
exports.getNextId = getNextId;
const ensureDate = (value) => {
    if (value instanceof Date)
        return value;
    if (value instanceof firestore_1.Timestamp)
        return value.toDate();
    if (typeof value === "string" || typeof value === "number") {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
};
exports.ensureDate = ensureDate;
