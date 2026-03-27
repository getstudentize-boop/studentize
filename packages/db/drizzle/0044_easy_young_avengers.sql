CREATE INDEX "membership_user_id_idx" ON "membership" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "membership_org_id_idx" ON "membership" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "membership_user_org_idx" ON "membership" USING btree ("user_id","organization_id");