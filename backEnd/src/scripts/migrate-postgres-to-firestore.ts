/**
 * Script de migração de dados PostgreSQL (Prisma) -> Firestore.
 * Uso: npx ts-node src/scripts/migrate-postgres-to-firestore.ts
 * Atenção: execute em ambiente controlado (não roda automaticamente em produção).
 */
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import { firestore } from "../infra/firebase";

const prisma = new PrismaClient();

const USERS = "users";
const TEACHER_PROFILES = "teacherProfiles";
const TEACHER_CLASSES = "teacherClasses";
const SCHEDULES = "schedules";

const resetCounters = async () => {
  const counters = ["users", "teacherProfiles", "teacherClasses", "schedules"];
  for (const c of counters) {
    await firestore.collection("counters").doc(c).set({ current: 0 }, { merge: true });
  }
};

const migrateUsers = async () => {
  const users = await prisma.user.findMany({
    include: { teacherProfile: true, teacherClasses: true },
    orderBy: { id: "asc" },
  });

  const batch = firestore.batch();
  for (const user of users) {
    const userRef = firestore.collection(USERS).doc(String(user.id));
    batch.set(userRef, {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      authProvider: user.authProvider,
      authProviderId: user.authProviderId ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    if (user.teacherProfile) {
      const profileRef = firestore.collection(TEACHER_PROFILES).doc(String(user.teacherProfile.id));
      batch.set(profileRef, {
        id: user.teacherProfile.id,
        userId: user.id,
        phone: user.teacherProfile.phone,
        city: user.teacherProfile.city,
        region: user.teacherProfile.region ?? null,
        experience: user.teacherProfile.experience ?? null,
        profilePhoto: user.teacherProfile.profilePhoto ?? null,
        advertisesFromHome: user.teacherProfile.advertisesFromHome,
        advertisesTravel: user.teacherProfile.advertisesTravel,
        advertisesOnline: user.teacherProfile.advertisesOnline,
        wantsToAdvertise: user.teacherProfile.wantsToAdvertise,
        createdAt: user.teacherProfile.createdAt,
        updatedAt: user.teacherProfile.updatedAt,
      });
    }

    if (user.teacherClasses?.length) {
      for (const cls of user.teacherClasses) {
        const classRef = firestore.collection(TEACHER_CLASSES).doc(String(cls.id));
        batch.set(classRef, {
          id: cls.id,
          teacherId: cls.teacherId,
          title: cls.title,
          description: cls.description ?? null,
          subject: cls.subject ?? null,
          modality: cls.modality,
          startTime: cls.startTime ?? null,
          durationMinutes: cls.durationMinutes,
          price: cls.price ? Number(cls.price) : null,
          priceCents: cls.priceCents ?? null,
          location: cls.location ?? null,
          active: cls.active,
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt,
        });
      }
    }
  }
  await batch.commit();
  console.log(`Migrated ${users.length} users (+profiles/classes).`);
};

const migrateSchedules = async () => {
  const schedules = await prisma.schedule.findMany({
    include: {
      offer: true,
      teacher: { select: { id: true } },
      student: { select: { id: true } },
    },
    orderBy: { id: "asc" },
  });

  const chunks = (arr: any[], size: number) =>
    arr.reduce((acc, _, idx) => (idx % size === 0 ? [...acc, arr.slice(idx, idx + size)] : acc), [] as any[][]);

  let total = 0;
  for (const batchItems of chunks(schedules, 400)) {
    const batch = firestore.batch();
    for (const sched of batchItems) {
      const ref = firestore.collection(SCHEDULES).doc(String(sched.id));
      batch.set(ref, {
        id: sched.id,
        offerId: sched.offerId ?? null,
        studentId: sched.studentId,
        teacherId: sched.teacherId,
        startTime: sched.startTime,
        endTime: sched.endTime,
        status: sched.status,
        notes: sched.notes ?? null,
        createdAt: sched.createdAt,
        updatedAt: sched.updatedAt,
      });
    }
    await batch.commit();
    total += batchItems.length;
  }
  console.log(`Migrated ${total} schedules/bookings.`);
};

const main = async () => {
  console.log("Starting migration Prisma -> Firestore...");
  await resetCounters();
  await migrateUsers();
  await migrateSchedules();
  console.log("Migration completed.");
};

main()
  .catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    if (admin.apps.length) {
      await firestore.terminate?.().catch(() => {});
    }
  });
