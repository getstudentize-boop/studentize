import { Dialog } from "@/components/dialog";
import { FileMagnifyingGlassIcon } from "@phosphor-icons/react";
import Markdown from "react-markdown";

export const SearchTranscriptionsTool = ({
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
          <FileMagnifyingGlassIcon />
          <div>Transcription Search</div>
        </button>
      }
      className="p-0"
    >
      <div className="px-4 py-3 border-bzinc border-b flex gap-4 items-center">
        <FileMagnifyingGlassIcon />
        Search through session transcriptions
      </div>
      <div className="p-4 pt-2">
        <div className="p-2 mb-1">
          <div className="font-semibold mb-1">Query String</div>
          {input.query}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-gradient-to-b from-zinc-100 to-white">
          <div className="px-4 py-2 font-semibold border-b border-zinc-200">
            Response
          </div>
          <div className="p-4">
            <Markdown>{output.response}</Markdown>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
