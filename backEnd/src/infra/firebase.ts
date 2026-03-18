import admin from "firebase-admin";
import { bucket } from "../config/firebaseAdmin";

const app = admin.app();
const auth = admin.auth(app);
const db = admin.firestore(app);
const storage = admin.storage(app);
const firestore = db;

export { admin, app, auth, db, firestore, storage, bucket };
export default app;
