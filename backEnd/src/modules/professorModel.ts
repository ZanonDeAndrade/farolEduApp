import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

const teacherProfileSelect = {
  id: true,
  phone: true,
  city: true,
  region: true,
  teachingModes: true,
  languages: true,
  hourlyRate: true,
  adTitle: true,
  methodology: true,
  about: true,
  experience: true,
  profilePhoto: true,
  advertisesFromHome: true,
  advertisesTravel: true,
  advertisesOnline: true,
  wantsToAdvertise: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TeacherProfileSelect;

type AuthProviderValue = "EMAIL" | "GOOGLE" | "FACEBOOK";

export const createTeacherWithProfile = async (data: {
  name: string;
  email: string;
  password: string;
  authProvider: AuthProviderValue;
  authProviderId?: string | null;
  profile: {
    phone: string;
    city: string;
    region?: string | null;
    teachingModes: string[];
    languages: string[];
    hourlyRate?: number | Prisma.Decimal | null;
    adTitle: string;
    methodology: string;
    about: string;
    experience?: string | null;
    profilePhoto?: string | null;
    wantsToAdvertise?: boolean;
  };
}) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "teacher",
        authProvider: data.authProvider,
        authProviderId: data.authProviderId ?? null,
        teacherProfile: {
          create: {
            phone: data.profile.phone,
            city: data.profile.city,
            region: data.profile.region ?? null,
            teachingModes: data.profile.teachingModes,
            languages: data.profile.languages,
            hourlyRate: data.profile.hourlyRate ?? null,
            adTitle: data.profile.adTitle,
            methodology: data.profile.methodology,
            about: data.profile.about,
            experience: data.profile.experience ?? null,
            profilePhoto: data.profile.profilePhoto ?? null,
            advertisesFromHome: data.profile.teachingModes.includes("home"),
            advertisesTravel: data.profile.teachingModes.includes("travel"),
            advertisesOnline: data.profile.teachingModes.includes("online"),
            wantsToAdvertise: data.profile.wantsToAdvertise ?? false,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        authProvider: true,
        authProviderId: true,
        teacherProfile: { select: teacherProfileSelect },
      },
    });
    return user;
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new Error("EMAIL_ALREADY_TAKEN");
    }
    throw err;
  }
};

export const getAllTeachers = async () => {
  const teachers = await prisma.user.findMany({
    where: { role: { equals: "teacher", mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authProvider: true,
      teacherProfile: { select: teacherProfileSelect },
    },
    orderBy: { id: "asc" },
  });
  return teachers;
};

export const getTeacherById = async (id: number) => {
  return prisma.user.findFirst({
    where: {
      id,
      role: { equals: "teacher", mode: "insensitive" },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      authProvider: true,
      teacherProfile: { select: teacherProfileSelect },
    },
  });
};

export const getUserByEmailWithPassword = async (email: string) => {
  return prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      password: true,
      authProvider: true,
      teacherProfile: { select: teacherProfileSelect },
    },
  });
};
