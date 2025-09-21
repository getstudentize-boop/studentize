import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import {
  ArrowUpRightIcon,
  FileMagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Link, useSearch } from "@tanstack/react-router";

export const SessionTranscriptionTool = ({ output }: { output: any }) => {
  const search = useSearch({ from: "/_authenticated/guru" });

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
      <div className="px-4 py-2 border-bzinc border-b flex gap-4 items-center">
        <FileMagnifyingGlassIcon />
        Session Transcription Tool Content
      </div>
      <div className="px-4 py-2">
        {JSON.stringify(output, null, 2)}

        <Link
          to="/students/$userId"
          target="_blank"
          rel="noopener noreferrer"
          params={{ userId: search.userId ?? "" }}
        >
          <Button className="w-full rounded-md gap-4 mt-2 mb-4">
            View User's Profile
            <ArrowUpRightIcon className="size-4" />
          </Button>
        </Link>
      </div>
    </Dialog>
  );
};
