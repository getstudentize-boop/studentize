-- Add new enum values to membership_role
ALTER TYPE "public"."membership_role" ADD VALUE 'ADVISOR';--> statement-breakpoint
ALTER TYPE "public"."membership_role" ADD VALUE 'STUDENT';--> statement-breakpoint

-- Update existing memberships based on user type
UPDATE "membership" m
SET "role" = CASE 
  WHEN u."type" = 'ADMIN' THEN 'ADMIN'::"membership_role"
  WHEN u."type" = 'ADVISOR' THEN 'ADVISOR'::"membership_role"
  WHEN u."type" = 'STUDENT' THEN 'STUDENT'::"membership_role"
  ELSE m."role"
END
FROM "user" u
WHERE m."user_id" = u."id";--> statement-breakpoint

-- Update any MEMBER roles to STUDENT (the new default)
UPDATE "membership" SET "role" = 'STUDENT' WHERE "role" = 'MEMBER';--> statement-breakpoint

-- Drop the type column from user table
ALTER TABLE "user" DROP COLUMN "type";--> statement-breakpoint

-- Drop the user_type enum
DROP TYPE "public"."user_type";
