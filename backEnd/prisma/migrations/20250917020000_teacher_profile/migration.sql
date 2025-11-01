-- AlterTable
ALTER TABLE "public"."User"
ADD COLUMN "authProvider" TEXT NOT NULL DEFAULT 'EMAIL',
ADD COLUMN "authProviderId" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."teacher_profiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "teachingModes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "hourlyRate" DECIMAL(10,2),
    "adTitle" TEXT NOT NULL,
    "methodology" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "experience" TEXT,
    "profilePhoto" TEXT,
    "advertisesFromHome" BOOLEAN NOT NULL DEFAULT FALSE,
    "advertisesTravel" BOOLEAN NOT NULL DEFAULT FALSE,
    "advertisesOnline" BOOLEAN NOT NULL DEFAULT FALSE,
    "wantsToAdvertise" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "teacher_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "teacher_profiles_userId_key" UNIQUE ("userId"),
    CONSTRAINT "teacher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
