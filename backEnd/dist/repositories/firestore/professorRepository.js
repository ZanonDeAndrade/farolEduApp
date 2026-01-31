"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreProfessorRepository = void 0;
const firebase_1 = require("../../infra/firebase");
const helpers_1 = require("./helpers");
const USERS = "users";
const TEACHER_PROFILES = "teacherProfiles";
const TEACHER_CLASSES = "teacherClasses";
const mapUser = (data, id) => ({
    id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    authProvider: data.authProvider ?? "EMAIL",
    authProviderId: data.authProviderId ?? null,
    createdAt: (0, helpers_1.fromTimestamp)(data.createdAt) ?? new Date(),
    updatedAt: (0, helpers_1.fromTimestamp)(data.updatedAt) ?? new Date(),
});
const mapProfile = (data, id) => ({
    id,
    userId: data?.userId,
    phone: data?.phone ?? "",
    city: data?.city ?? "",
    region: data?.region ?? null,
    experience: data?.experience ?? null,
    profilePhoto: data?.profilePhoto ?? null,
    advertisesFromHome: Boolean(data?.advertisesFromHome),
    advertisesTravel: Boolean(data?.advertisesTravel),
    advertisesOnline: Boolean(data?.advertisesOnline),
    wantsToAdvertise: Boolean(data?.wantsToAdvertise),
    createdAt: (0, helpers_1.fromTimestamp)(data?.createdAt) ?? new Date(),
    updatedAt: (0, helpers_1.fromTimestamp)(data?.updatedAt) ?? new Date(),
});
const mapClass = (data, id) => ({
    id,
    teacherId: data.teacherId,
    title: data.title,
    description: data.description ?? null,
    subject: data.subject ?? null,
    modality: data.modality,
    startTime: (0, helpers_1.fromTimestamp)(data.startTime),
    durationMinutes: data.durationMinutes,
    price: data.price ?? null,
    priceCents: data.priceCents ?? null,
    location: data.location ?? null,
    active: Boolean(data.active),
    createdAt: (0, helpers_1.fromTimestamp)(data.createdAt) ?? new Date(),
    updatedAt: (0, helpers_1.fromTimestamp)(data.updatedAt) ?? new Date(),
});
class FirestoreProfessorRepository {
    async createTeacherWithProfile(data) {
        const normalizedEmail = data.email.toLowerCase();
        const existing = await (0, helpers_1.getCollection)(USERS).where("email", "==", normalizedEmail).limit(1).get();
        if (!existing.empty) {
            const err = new Error("EMAIL_ALREADY_TAKEN");
            err.code = "P2002";
            throw err;
        }
        const now = new Date();
        const userId = await (0, helpers_1.getNextId)(USERS);
        const profileId = await (0, helpers_1.getNextId)(TEACHER_PROFILES);
        const userPayload = {
            id: userId,
            name: data.name,
            email: normalizedEmail,
            password: data.password,
            role: "teacher",
            authProvider: data.authProvider,
            authProviderId: data.authProviderId ?? null,
            createdAt: now,
            updatedAt: now,
        };
        const profilePayload = {
            id: profileId,
            userId,
            phone: data.profile.phone,
            city: data.profile.city,
            region: data.profile.region ?? null,
            experience: data.profile.experience ?? null,
            profilePhoto: data.profile.profilePhoto ?? null,
            advertisesFromHome: Boolean(data.profile.advertisesFromHome),
            advertisesTravel: Boolean(data.profile.advertisesTravel),
            advertisesOnline: Boolean(data.profile.advertisesOnline),
            wantsToAdvertise: Boolean(data.profile.wantsToAdvertise),
            createdAt: now,
            updatedAt: now,
        };
        await firebase_1.firestore.runTransaction(async (tx) => {
            tx.set(firebase_1.firestore.collection(USERS).doc(String(userId)), userPayload);
            tx.set(firebase_1.firestore.collection(TEACHER_PROFILES).doc(String(profileId)), profilePayload);
        });
        return { ...mapUser(userPayload, userId), teacherProfile: mapProfile(profilePayload, profileId) };
    }
    async getAllTeachers() {
        const usersSnap = await (0, helpers_1.getCollection)(USERS).where("role", "==", "teacher").get();
        const profilesSnap = await (0, helpers_1.getCollection)(TEACHER_PROFILES)
            .where("userId", "in", usersSnap.docs.map(doc => Number(doc.id)))
            .get()
            .catch(() => ({ empty: true, docs: [] }));
        const profilesMap = new Map();
        for (const doc of profilesSnap.docs ?? []) {
            const profile = mapProfile(doc.data(), Number(doc.id));
            profilesMap.set(profile.userId, profile);
        }
        return usersSnap.docs
            .map(doc => {
            const user = mapUser(doc.data(), Number(doc.id));
            return { ...user, teacherProfile: profilesMap.get(user.id) ?? null };
        })
            .sort((a, b) => a.id - b.id);
    }
    async getTeacherById(id) {
        const doc = await (0, helpers_1.getCollection)(USERS).doc(String(id)).get();
        if (!doc.exists)
            return null;
        const user = mapUser(doc.data(), Number(doc.id));
        if ((user.role || "").toLowerCase() !== "teacher")
            return null;
        const profileSnap = await (0, helpers_1.getCollection)(TEACHER_PROFILES).where("userId", "==", user.id).limit(1).get();
        const profile = profileSnap.empty ? null : mapProfile(profileSnap.docs[0].data(), Number(profileSnap.docs[0].id));
        return { ...user, teacherProfile: profile };
    }
    async getUserByEmailWithPassword(email) {
        const snap = await (0, helpers_1.getCollection)(USERS).where("email", "==", email.toLowerCase()).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const user = mapUser(doc.data(), Number(doc.id));
        const profileSnap = await (0, helpers_1.getCollection)(TEACHER_PROFILES).where("userId", "==", user.id).limit(1).get();
        const profile = profileSnap.empty ? null : mapProfile(profileSnap.docs[0].data(), Number(profileSnap.docs[0].id));
        return { ...user, teacherProfile: profile };
    }
    async getTeacherWithClasses(id) {
        const teacher = await this.getTeacherById(id);
        if (!teacher)
            return null;
        const classesSnap = await (0, helpers_1.getCollection)(TEACHER_CLASSES)
            .where("teacherId", "==", id)
            .orderBy("createdAt", "desc")
            .get();
        const classes = classesSnap.docs.map(doc => mapClass(doc.data(), Number(doc.id)));
        return { ...teacher, teacherClasses: classes };
    }
}
exports.FirestoreProfessorRepository = FirestoreProfessorRepository;
