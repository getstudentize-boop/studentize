import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { cn } from "@/utils/cn";
import {
  CheckIcon,
  SubtitlesIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { TrashSimpleIcon } from "@phosphor-icons/react/dist/icons/TrashSimple";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useState } from "react";

export const DeleteSession = ({
  scheduledSessionId,
}: {
  scheduledSessionId: string;
}) => {
  const [isSecondOptionSelected, setIsSecondOptionSelected] = useState(false);

  const deleteMutation = useMutation(
    orpc.scheduledSession.delete.mutationOptions({})
  );

  return (
    <Dialog
      trigger={
        <Button variant="destructive" className="rounded-md">
          <TrashSimpleIcon />
          Delete session
        </Button>
      }
      onOpenChange={(isOpen) => [!isOpen && setIsSecondOptionSelected(false)]}
      className="flex flex-col h-96 gap-4 text-center rounded-2xl"
    >
      <div className="border border-zinc-200 bg-zinc-50 shadow-xs rounded-lg flex-1 px-10 flex flex-col items-center justify-center">
        <SubtitlesIcon size={24} />
        <div className="font-semibold mt-2 mb-0.5">Create a new session</div>
        <div>Delete scheduled session but create a new session</div>
      </div>
      <div
        className={cn(
          "border border-rose-100 bg-rose-50/50 cursor-pointer shadow-xs rounded-lg flex-1 px-10 flex flex-col items-center justify-center",
          { "flex-row gap-4 cursor-auto": isSecondOptionSelected }
        )}
        onClick={() => {
          if (!isSecondOptionSelected) {
            setIsSecondOptionSelected(true);
          }
        }}
      >
        {isSecondOptionSelected ? (
          <>
            <Button
              className="rounded-md"
              onClick={() => {
                setIsSecondOptionSelected(false);
              }}
            >
              <XIcon size={14} />
              Cancel
            </Button>
            <Button
              className="rounded-md"
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate({ scheduledSessionId });
              }}
              isLoading={deleteMutation.isPending}
            >
              <CheckIcon size={14} />
              Confirm
            </Button>
          </>
        ) : (
          <>
            <TrashIcon size={24} />
            <div className="font-semibold mt-2 mb-0.5">Delete this session</div>
            <div>
              This will permanently delete the session, the bot will not join
              the meeting anymore.
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
};
