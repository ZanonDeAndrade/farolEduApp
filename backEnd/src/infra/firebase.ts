import admin, { ServiceAccount } from "firebase-admin";

const SERVICE_ACCOUNT_ENV = process.env.FIREBASE_SERVICE_ACCOUNT;

const parseServiceAccount = (): ServiceAccount => {
  if (!SERVICE_ACCOUNT_ENV) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT não configurada");
  }

  const trimmed = SERVICE_ACCOUNT_ENV.trim();
  try {
    // Suporta JSON direto ou base64 do JSON
    const jsonString = trimmed.startsWith("{")
      ? trimmed
      : Buffer.from(trimmed, "base64").toString("utf-8");
    return JSON.parse(jsonString) as ServiceAccount;
  } catch (error) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT inválida (não foi possível fazer parse do JSON)");
  }
};

const getApp = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const credential = admin.credential.cert(parseServiceAccount());
  return admin.initializeApp({
    credential,
  });
};

const app = getApp();

export const firestore = app.firestore();
export const firebaseAuth = app.auth();
