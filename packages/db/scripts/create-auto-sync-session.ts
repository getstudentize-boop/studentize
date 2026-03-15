import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { db, createId } from "../src";
import * as schema from "../src/schema";
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? "";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const SAMPLE_TRANSCRIPTION = `Advisor: Hi, welcome to today's session. How have things been going since we last spoke?

Student: Pretty good. I've been working on my personal statement like we discussed.

Advisor: That's great to hear. Have you settled on a main theme or angle yet?

Student: I think so. I want to focus on my experience volunteering at the local clinic and how that sparked my interest in biomedical engineering.

Advisor: That's a strong choice — it ties your extracurriculars directly to your intended major. Have you started drafting yet?

Student: I have a rough first draft. It's about 500 words so far.

Advisor: Good progress. Let's plan to review that together next session. For now, let's talk about your university shortlist. Have you had a chance to look into the programs I suggested?

Student: Yes, I looked at Imperial College and UCL for the UK, and MIT and Johns Hopkins for the US.

Advisor: Excellent choices. What stood out to you about each?

Student: I really liked Imperial's curriculum structure — it seems very hands-on. And MIT obviously has amazing research opportunities.

Advisor: Both are strong fits for your profile. Let's also think about adding a couple of target schools where you'd be very competitive. That way you have a balanced list.

Student: That makes sense. Could you suggest a few?

Advisor: Absolutely. I'll put together a shortlist of 3-4 additional universities for you to research before our next session. We should also start thinking about your recommendation letters — have you identified which teachers you'd like to ask?

Student: I was thinking my biology teacher and my maths teacher.

Advisor: Perfect. Both are relevant to your field. I'd recommend approaching them soon so they have plenty of time. Let's make that a priority for this week.

Student: Will do. Thanks for the guidance.

Advisor: Of course. You're making excellent progress. Let's recap: finish your personal statement draft, research the additional universities I'll send, and reach out to your teachers about recommendations. Sound good?

Student: Sounds great. See you next time.

Advisor: See you then. Keep up the great work.`;

async function main() {
  const sessionId = createId();
  const title = "Test Auto-Sync Session";

  console.log("Creating auto-sync session...");
  console.log(`  Session ID: ${sessionId}`);
  console.log(`  Title: ${title}`);

  // 1. Create session with no studentUserId or advisorUserId (auto-sync state)
  await db.insert(schema.session).values({
    id: sessionId,
    title,
  });

  console.log("✅ Session row created (null student/advisor)");

  // 2. Upload temporary transcription to S3
  const key = `temporary/${sessionId}.txt`;

  await s3.send(
    new PutObjectCommand({
      Bucket: "transcription",
      Key: key,
      Body: SAMPLE_TRANSCRIPTION,
      ContentType: "text/plain",
    })
  );

  console.log(`✅ Temporary transcription uploaded to s3://transcription/${key}`);
  console.log("");
  console.log("Session is now ready in the Auto-Sync list.");
  console.log("Assign a student and advisor in the admin UI to complete the sync.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed:", err);
    process.exit(1);
  });
