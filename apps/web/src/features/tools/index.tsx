import { Dialog } from "@/components/dialog";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ScrewdriverIcon,
} from "@phosphor-icons/react";
import { ReactNode } from "react";
import { StudentBioTool } from "./student-bio";
import { SearchTranscriptionsTool } from "./search-transcriptions";
import { SessionSummaryTool } from "./session-summary";
import { ListStudentSessionsTool } from "./list-student-sessions";
import { ReadSessionTranscription } from "./read-session-transcription";

export type ToolInput = Record<string, any>;
export type ToolOutput = Record<string, any> | string | number | undefined;

const ToolDialog = ({
  children,
  input,
  output,
}: {
  children: ReactNode;
  input: ToolInput;
  output: ToolOutput;
}) => {
  return (
    <Dialog
      trigger={<button>{children}</button>}
      className="flex flex-col gap-4"
    >
      <div className="rounded-md border-bzinc border">
        <div className="border-b border-bzinc px-4 py-2 flex gap-2 items-center justify-between">
          Input
          <ArrowRightIcon />
        </div>
        <div className="p-4">{JSON.stringify(input, null, 2)}</div>
      </div>
      <div className="rounded-md border-bzinc border">
        <div className="border-b border-bzinc px-4 py-2 flex gap-2 items-center justify-between">
          Output
          <ArrowLeftIcon />
        </div>
        <div className="p-4">{JSON.stringify(output, null, 2)}</div>
      </div>
    </Dialog>
  );
};

export const Tool = ({
  type,
  input,
  output,
}: {
  type: string;
  input: Record<string, any>;
  output: any;
}) => {
  switch (type) {
    case "tool-searchSessionTranscriptions":
      return <SearchTranscriptionsTool output={output} input={input} />;
    case "tool-studentInfo":
      return <StudentBioTool output={output} />;
    case "tool-sessionSummary":
      return <SessionSummaryTool output={output} input={input} />;
    case "tool-listStudentSessions":
      return <ListStudentSessionsTool output={output} input={input} />;
    case "tool-readFullSessionTranscript":
      return <ReadSessionTranscription output={output} input={input} />;
    default:
      return (
        <ToolDialog input={input} output={output}>
          <button className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center cursor-pointer">
            <ScrewdriverIcon />
            <div className="capitalize">
              {type.replace("tool-", "").replace(/([A-Z])/g, " $1")}
            </div>
          </button>
        </ToolDialog>
      );
  }
};
