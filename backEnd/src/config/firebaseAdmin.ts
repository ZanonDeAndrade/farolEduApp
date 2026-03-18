import { applicationDefault, cert, getApp, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const sanitize = (value?: string): string | undefined => {
  if (!value) return undefined;
  const cleaned = value.replace(/^['"]|['"]$/g, "").trim();
  if (!cleaned || cleaned.toLowerCase() === "undefined" || cleaned.toLowerCase() === "null") {
    return undefined;
  }
  return cleaned;
};

const getStorageBucketEnv = (): string | undefined => {
  return sanitize(process.env.FIREBASE_STORAGE_BUCKET);
};

const getServiceAccountJsonEnv = (): string | undefined => {
  return sanitize(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
};

const getLegacyServiceAccountEnv = (): string | undefined => {
  return sanitize(process.env.FIREBASE_SERVICE_ACCOUNT);
};

const getServiceAccountEnv = (): string | undefined => {
  return getServiceAccountJsonEnv() ?? getLegacyServiceAccountEnv();
};

const decodeServiceAccountJson = (rawValue: string): string => {
  const trimmed = rawValue.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  try {
    const decoded = Buffer.from(trimmed, "base64").toString("utf-8").trim();
    if (decoded.startsWith("{")) {
      return decoded;
    }
  } catch {
    // fall through to the JSON parse error below with the original value
  }

  return trimmed;
};

const parseServiceAccount = (rawValue: string): ServiceAccount => {
  let parsed: Record<string, unknown>;
  const rawJson = decodeServiceAccountJson(rawValue);

  try {
    parsed = JSON.parse(rawJson) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      "Firebase service account is not valid JSON. Use FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT.",
    );
  }

  const projectId = sanitize(
    typeof parsed.project_id === "string"
      ? parsed.project_id
      : typeof parsed.projectId === "string"
      ? parsed.projectId
      : undefined,
  );
  const clientEmail = sanitize(
    typeof parsed.client_email === "string"
      ? parsed.client_email
      : typeof parsed.clientEmail === "string"
      ? parsed.clientEmail
      : undefined,
  );
  const rawPrivateKey = sanitize(
    typeof parsed.private_key === "string"
      ? parsed.private_key
      : typeof parsed.privateKey === "string"
      ? parsed.privateKey
      : undefined,
  );
  const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, "\n") : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase service account must contain project_id, client_email and private_key.",
    );
  }

  return { projectId, clientEmail, privateKey };
};

const resolveCredential = () => {
  const serviceAccount = getServiceAccountEnv();
  if (serviceAccount) {
    return cert(parseServiceAccount(serviceAccount));
  }

  return applicationDefault();
};

const validateBucket = (bucketName?: string): string => {
  if (!bucketName) {
    throw new Error("FIREBASE_STORAGE_BUCKET is required (example: faroledu-740ef.firebasestorage.app).");
  }

  if (bucketName.startsWith("gs://")) {
    throw new Error("FIREBASE_STORAGE_BUCKET must not include gs:// prefix.");
  }

  return bucketName;
};

const createFirebaseApp = (): App => {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: resolveCredential(),
    storageBucket: validateBucket(getStorageBucketEnv()),
  });
};

export const firebaseApp = createFirebaseApp();
export const storage = getStorage(firebaseApp);
export const bucket = storage.bucket(validateBucket(getStorageBucketEnv()));
