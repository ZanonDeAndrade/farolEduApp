"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucket = exports.storage = exports.firebaseApp = void 0;
const app_1 = require("firebase-admin/app");
const storage_1 = require("firebase-admin/storage");
const sanitize = (value) => {
    if (!value)
        return undefined;
    const cleaned = value.replace(/^['"]|['"]$/g, "").trim();
    if (!cleaned || cleaned.toLowerCase() === "undefined" || cleaned.toLowerCase() === "null") {
        return undefined;
    }
    return cleaned;
};
const getStorageBucketEnv = () => {
    return sanitize(process.env.FIREBASE_STORAGE_BUCKET);
};
const getServiceAccountJsonEnv = () => {
    return sanitize(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
};
const getLegacyServiceAccountEnv = () => {
    return sanitize(process.env.FIREBASE_SERVICE_ACCOUNT);
};
const getServiceAccountEnv = () => {
    return getServiceAccountJsonEnv() ?? getLegacyServiceAccountEnv();
};
const decodeServiceAccountJson = (rawValue) => {
    const trimmed = rawValue.trim();
    if (trimmed.startsWith("{")) {
        return trimmed;
    }
    try {
        const decoded = Buffer.from(trimmed, "base64").toString("utf-8").trim();
        if (decoded.startsWith("{")) {
            return decoded;
        }
    }
    catch {
        // fall through to the JSON parse error below with the original value
    }
    return trimmed;
};
const parseServiceAccount = (rawValue) => {
    let parsed;
    const rawJson = decodeServiceAccountJson(rawValue);
    try {
        parsed = JSON.parse(rawJson);
    }
    catch (error) {
        throw new Error("Firebase service account is not valid JSON. Use FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT.");
    }
    const projectId = sanitize(typeof parsed.project_id === "string"
        ? parsed.project_id
        : typeof parsed.projectId === "string"
            ? parsed.projectId
            : undefined);
    const clientEmail = sanitize(typeof parsed.client_email === "string"
        ? parsed.client_email
        : typeof parsed.clientEmail === "string"
            ? parsed.clientEmail
            : undefined);
    const rawPrivateKey = sanitize(typeof parsed.private_key === "string"
        ? parsed.private_key
        : typeof parsed.privateKey === "string"
            ? parsed.privateKey
            : undefined);
    const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, "\n") : undefined;
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Firebase service account must contain project_id, client_email and private_key.");
    }
    return { projectId, clientEmail, privateKey };
};
const resolveCredential = () => {
    const serviceAccount = getServiceAccountEnv();
    if (serviceAccount) {
        return (0, app_1.cert)(parseServiceAccount(serviceAccount));
    }
    return (0, app_1.applicationDefault)();
};
const validateBucket = (bucketName) => {
    if (!bucketName) {
        throw new Error("FIREBASE_STORAGE_BUCKET is required (example: faroledu-740ef.firebasestorage.app).");
    }
    if (bucketName.startsWith("gs://")) {
        throw new Error("FIREBASE_STORAGE_BUCKET must not include gs:// prefix.");
    }
    return bucketName;
};
const createFirebaseApp = () => {
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApp)();
    }
    return (0, app_1.initializeApp)({
        credential: resolveCredential(),
        storageBucket: validateBucket(getStorageBucketEnv()),
    });
};
exports.firebaseApp = createFirebaseApp();
exports.storage = (0, storage_1.getStorage)(exports.firebaseApp);
exports.bucket = exports.storage.bucket(validateBucket(getStorageBucketEnv()));
