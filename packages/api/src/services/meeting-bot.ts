import { recallRequest, BOT_NAME } from "../utils/recall";

type MeetingInformation = {
  id: string;
  bot_name: string;
  join_at: string;
  status_changes: Array<{
    code: "done";
    message: null;
    created_at: string;
    sub_code: null;
  }>;
  recordings: Array<{
    id: string;
    media_shortcuts: {
      transcript: { id: string; data: { download_url: string } };
      video_mixed: { id: string; data: { download_url: string } };
    };
  }>;
};

const downloadTranscript = async (downloadUrl: string) => {
  const transcriptJson = await fetch(downloadUrl);

  const transcriptData = (await transcriptJson.json()) as Array<{
    participant: {
      id: string;
      name: string;
      is_host: boolean;
      email: string;
    };
    words: Array<{
      text: string;
      start_timestamp: {
        relative: number;
        absolute: string;
      };
      end_timestamp: {
        relative: number;
        absolute: string;
      };
    }>;
  }>;

  return transcriptData;
};

export class MeetingBotService {
  async sendToMeeting(input: { meetingCode: string }) {
    const { meetingCode } = input;

    const response = await recallRequest({
      endpoint: "/bot",
      body: {
        meeting_url: `https://meet.google.com/${meetingCode}`,
        bot_name: BOT_NAME,
        recording_config: {
          transcript: { provider: { meeting_captions: {} } },
        },
      },
    });

    return response as {
      id: string;
      meeting_url: { meeting_id: string; platform: string };
      join_at: string;
    };
  }

  async getMeetingInformation(input: { botId: string }) {
    const { botId } = input;

    const response = await recallRequest({
      endpoint: `/bot/${botId}`,
    });

    return response as MeetingInformation;
  }

  async getMeetingTranscription(input: { information: MeetingInformation }) {
    const { information } = input;

    const transcriptRecording = information.recordings.find(
      (recording) => recording.media_shortcuts.transcript !== undefined
    );

    if (!transcriptRecording) {
      throw new Error("Transcript recording not found");
    }

    const data = await downloadTranscript(
      transcriptRecording.media_shortcuts.transcript.data.download_url
    );

    return data;
  }

  async getRecording(input: { recordingId: string }) {
    const { recordingId } = input;

    const response = await recallRequest({
      endpoint: `/recording/${recordingId}`,
    });

    console.log("🔥", response);

    return response;
  }
}
