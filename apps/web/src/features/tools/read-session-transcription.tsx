import { Dialog } from "@/components/dialog";
import { ListMagnifyingGlassIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Markdown } from "@/components/markdown";

export const ReadSessionTranscription = ({
  output = {},
  input = {},
}: {
  output: any;
  input: any;
}) => {
  return (
    <Dialog
      trigger={
        <button className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center cursor-pointer">
          <ListMagnifyingGlassIcon />
          <div>Read Full Session Transcription</div>
        </button>
      }
      className="p-0"
    >
      <div className="px-4 py-3 border-bzinc border-b flex gap-4 items-center">
        <ListMagnifyingGlassIcon />
        Read Full Session Transcription{" "}
        <Link
          to="/sessions/$sessionId"
          params={{ sessionId: input.sessionId }}
          className="hover:underline font-semibold"
        >
          ({input.sessionId})
        </Link>
      </div>
      <div className="p-4 max-h-96 w-full overflow-y-auto custom-scrollbar">
        <Markdown>{output}</Markdown>
      </div>
    </Dialog>
  );
};
