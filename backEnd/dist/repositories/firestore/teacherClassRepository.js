"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreTeacherClassRepository = void 0;
const helpers_1 = require("./helpers");
const TEACHER_CLASSES = "teacherClasses";
const USERS = "users";
const PROFILES = "teacherProfiles";
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
const normalizeModality = (value) => (value ?? "ONLINE").toString().trim().toUpperCase() || "ONLINE";
const normalizePriceCents = (price, priceCents) => {
    if (priceCents !== undefined && priceCents !== null && Number.isFinite(priceCents)) {
        return Math.max(0, Math.trunc(priceCents));
    }
    if (price !== undefined && price !== null && Number.isFinite(price)) {
        return Math.max(0, Math.trunc(price * 100));
    }
    return null;
};
class FirestoreTeacherClassRepository {
    async createTeacherClass(input) {
        if (!Number.isFinite(input.teacherId)) {
            throw new Error("INVALID_TEACHER_ID");
        }
        if (!(input.title ?? "").trim()) {
            throw new Error("TITLE_REQUIRED");
        }
        const now = new Date();
        const id = await (0, helpers_1.getNextId)(TEACHER_CLASSES);
        const priceCents = normalizePriceCents(input.price, input.priceCents);
        const payload = {
            id,
            teacherId: input.teacherId,
            title: input.title.trim(),
            description: input.description?.trim() || null,
            subject: input.subject?.trim() || null,
            modality: normalizeModality(input.modality),
            startTime: input.startTime ?? null,
            durationMinutes: Number.isFinite(input.durationMinutes) && input.durationMinutes
                ? Math.max(15, Math.round(input.durationMinutes))
                : 60,
            price: input.price ?? (priceCents !== null ? priceCents / 100 : null),
            priceCents,
            location: input.location?.trim() || null,
            active: input.active ?? true,
            createdAt: now,
            updatedAt: now,
        };
        await (0, helpers_1.getCollection)(TEACHER_CLASSES).doc(String(id)).set(payload);
        return mapClass(payload, id);
    }
    async updateTeacherClassByTeacher(teacherId, classId, data) {
        if (!Number.isFinite(teacherId) || !Number.isFinite(classId)) {
            throw new Error("INVALID_IDS");
        }
        const ref = (0, helpers_1.getCollection)(TEACHER_CLASSES).doc(String(classId));
        const snap = await ref.get();
        if (!snap.exists)
            return null;
        const existing = mapClass(snap.data(), classId);
        if (existing.teacherId !== teacherId)
            return null;
        const priceCents = data.price !== undefined || data.priceCents !== undefined
            ? normalizePriceCents(data.price, data.priceCents)
            : existing.priceCents;
        const price = data.price !== undefined
            ? data.price === null
                ? null
                : Number(data.price)
            : data.priceCents !== undefined
                ? data.priceCents === null
                    ? null
                    : data.priceCents / 100
                : existing.price;
        const updated = {
            ...existing,
            title: data.title?.trim() ?? existing.title,
            description: data.description?.trim() ?? existing.description,
            subject: data.subject?.trim() ?? existing.subject,
            modality: data.modality ? normalizeModality(data.modality) : existing.modality,
            startTime: data.startTime ?? existing.startTime,
            durationMinutes: Number.isFinite(data.durationMinutes) && data.durationMinutes
                ? Math.max(15, Math.round(data.durationMinutes))
                : existing.durationMinutes,
            price,
            priceCents,
            location: data.location?.trim() ?? existing.location,
            active: typeof data.active === "boolean" ? data.active : existing.active,
            updatedAt: new Date(),
        };
        await ref.set(updated);
        return updated;
    }
    async deleteTeacherClassByTeacher(teacherId, classId) {
        if (!Number.isFinite(teacherId) || !Number.isFinite(classId)) {
            throw new Error("INVALID_IDS");
        }
        const ref = (0, helpers_1.getCollection)(TEACHER_CLASSES).doc(String(classId));
        const snap = await ref.get();
        if (!snap.exists)
            return null;
        const cls = mapClass(snap.data(), classId);
        if (cls.teacherId !== teacherId)
            return null;
        await ref.delete();
        return true;
    }
    async getTeacherClassesByTeacher(teacherId) {
        if (!Number.isFinite(teacherId))
            throw new Error("INVALID_TEACHER_ID");
        const snap = await (0, helpers_1.getCollection)(TEACHER_CLASSES)
            .where("teacherId", "==", teacherId)
            .orderBy("createdAt", "desc")
            .get();
        return snap.docs.map(doc => mapClass(doc.data(), Number(doc.id)));
    }
    async getPublicTeacherClasses(filters) {
        const { teacherId, modality, take, city, teacherName, query } = filters ?? {};
        const normalizedTake = Number.isFinite(take) ? Math.min(Math.max(Number(take), 1), 50) : 12;
        let ref = (0, helpers_1.getCollection)(TEACHER_CLASSES).where("active", "==", true);
        if (Number.isFinite(teacherId)) {
            ref = ref.where("teacherId", "==", Number(teacherId));
        }
        if (modality && modality.trim()) {
            ref = ref.where("modality", "==", modality.trim().toUpperCase());
        }
        // Firestore não suporta contains/OR aninhado: filtramos no app após buscar um subconjunto ordenado
        ref = ref.orderBy("createdAt", "desc").limit(normalizedTake * 3);
        const snap = await ref.get();
        const classes = snap.docs.map(doc => mapClass(doc.data(), Number(doc.id)));
        const lowerQuery = query?.trim().toLowerCase();
        const lowerCity = city?.trim().toLowerCase();
        const lowerTeacherName = teacherName?.trim().toLowerCase();
        const teacherIds = Array.from(new Set(classes.map(c => c.teacherId)));
        const teacherDocs = teacherIds.length
            ? await (0, helpers_1.getCollection)(USERS)
                .where("id", "in", teacherIds.slice(0, 10)) // Firestore in limitado; para mais, faria lotes
                .get()
                .catch(() => ({ empty: true, docs: [] }))
            : { empty: true, docs: [] };
        const profileDocs = teacherIds.length
            ? await (0, helpers_1.getCollection)(PROFILES)
                .where("userId", "in", teacherIds.slice(0, 10))
                .get()
                .catch(() => ({ empty: true, docs: [] }))
            : { empty: true, docs: [] };
        const teacherMap = new Map();
        for (const doc of teacherDocs.docs ?? []) {
            const data = doc.data();
            teacherMap.set(Number(doc.id), {
                id: data.id,
                name: data.name,
                email: data.email,
                photoUrl: data.photoUrl ?? null,
                teacherProfile: null,
            });
        }
        for (const doc of profileDocs.docs ?? []) {
            const data = doc.data();
            const existing = teacherMap.get(data.userId);
            if (existing) {
                existing.teacherProfile = {
                    city: data.city ?? null,
                    region: data.region ?? null,
                    experience: data.experience ?? null,
                    profilePhoto: data.profilePhoto ?? null,
                    phone: data.phone ?? null,
                };
            }
        }
        const filtered = classes.filter(item => {
            const teacher = teacherMap.get(item.teacherId);
            if (lowerCity && teacher?.teacherProfile) {
                const combined = `${teacher.teacherProfile.city ?? ""} ${teacher.teacherProfile.region ?? ""}`.toLowerCase();
                if (!combined.includes(lowerCity))
                    return false;
            }
            if (lowerTeacherName && teacher?.name) {
                if (!teacher.name.toLowerCase().includes(lowerTeacherName))
                    return false;
            }
            if (lowerQuery) {
                const text = `${item.title} ${item.subject ?? ""} ${item.description ?? ""} ${teacher?.name ?? ""}`.toLowerCase();
                if (!text.includes(lowerQuery))
                    return false;
            }
            return true;
        });
        return filtered.slice(0, normalizedTake).map(cls => ({
            ...cls,
            teacher: teacherMap.get(cls.teacherId) ?? null,
        }));
    }
}
exports.FirestoreTeacherClassRepository = FirestoreTeacherClassRepository;
