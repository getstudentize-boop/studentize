ALTER TABLE "membership" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "membership" ALTER COLUMN "role" SET DEFAULT 'STUDENT'::text;--> statement-breakpoint
DROP TYPE "public"."membership_role";--> statement-breakpoint
CREATE TYPE "public"."membership_role" AS ENUM('OWNER', 'ADMIN', 'ADVISOR', 'STUDENT');--> statement-breakpoint
ALTER TABLE "membership" ALTER COLUMN "role" SET DEFAULT 'STUDENT'::"public"."membership_role";--> statement-breakpoint
ALTER TABLE "membership" ALTER COLUMN "role" SET DATA TYPE "public"."membership_role" USING "role"::"public"."membership_role";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "type";--> statement-breakpoint
DROP TYPE "public"."user_type";