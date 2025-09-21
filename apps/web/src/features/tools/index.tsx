import { Dialog } from "@/components/dialog";
import {
  FileMagnifyingGlassIcon,
  UserSquareIcon,
  SubtitlesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  Icon,
} from "@phosphor-icons/react";
import { ReactNode } from "react";
import { StudentBioTool } from "./student-bio";
import { SessionTranscriptionTool } from "./session-transcription";

const ToolDialog = ({
  children,
  input,
  output,
}: {
  children: ReactNode;
  input: Record<string, any>;
  output: any;
}) => {
  return (
    <Dialog trigger={children} className="flex flex-col gap-4">
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

const ToolButton = ({ icon, title }: { icon: Icon; title: string }) => {
  const Component = icon;

  return (
    <button className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center cursor-pointer">
      <Component />
      <div>{title}</div>
    </button>
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
      return <SessionTranscriptionTool output={output} />;
    case "tool-studentInfo":
      return <StudentBioTool output={output} />;
    case "tool-sessionSummary":
      return (
        <ToolDialog input={input} output={output}>
          <ToolButton icon={SubtitlesIcon} title="Session Summary" />
        </ToolDialog>
      );
    default:
      return null;
  }
};
