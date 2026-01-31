"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = exports.firestore = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const SERVICE_ACCOUNT_ENV = process.env.FIREBASE_SERVICE_ACCOUNT;
const parseServiceAccount = () => {
    if (!SERVICE_ACCOUNT_ENV) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT não configurada");
    }
    const trimmed = SERVICE_ACCOUNT_ENV.trim();
    try {
        // Suporta JSON direto ou base64 do JSON
        const jsonString = trimmed.startsWith("{")
            ? trimmed
            : Buffer.from(trimmed, "base64").toString("utf-8");
        return JSON.parse(jsonString);
    }
    catch (error) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT inválida (não foi possível fazer parse do JSON)");
    }
};
const getApp = () => {
    if (firebase_admin_1.default.apps.length) {
        return firebase_admin_1.default.app();
    }
    const credential = firebase_admin_1.default.credential.cert(parseServiceAccount());
    return firebase_admin_1.default.initializeApp({
        credential,
    });
};
const app = getApp();
exports.firestore = app.firestore();
exports.firebaseAuth = app.auth();
