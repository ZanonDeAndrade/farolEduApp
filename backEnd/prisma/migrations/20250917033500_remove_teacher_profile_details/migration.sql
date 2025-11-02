-- AlterTable
ALTER TABLE "public"."teacher_profiles"
DROP COLUMN IF EXISTS "hourlyRate",
DROP COLUMN IF EXISTS "adTitle",
DROP COLUMN IF EXISTS "methodology",
DROP COLUMN IF EXISTS "about";
