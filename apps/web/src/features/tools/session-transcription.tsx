import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import {
  ArrowUpRightIcon,
  FileMagnifyingGlassIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Link, useSearch } from "@tanstack/react-router";
import Markdown from "react-markdown";

export const SessionTranscriptionTool = ({
  output = {},
  input = {},
}: {
  output: any;
  input: any;
}) => {
  const search = useSearch({ from: "/_authenticated/guru" });

  console.log("Session Transcription output", input);

  return (
    <Dialog
      trigger={
        <button className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center cursor-pointer">
          <FileMagnifyingGlassIcon />
          <div>Session Transcription</div>
        </button>
      }
      className="p-0"
    >
      <div className="px-4 py-3 border-bzinc border-b flex gap-4 items-center">
        <FileMagnifyingGlassIcon />
        Session Transcription Tool Content
      </div>
      <div className="p-4 pt-2">
        <div className="p-2 mb-1">
          <div className="font-semibold mb-1">Query</div>
          {input.query}
        </div>

        <div className="rounded-lg border border-cyan-100 bg-gradient-to-b from-cyan-50 to-white">
          <div className="px-4 py-2 font-semibold border-b border-cyan-100">
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
