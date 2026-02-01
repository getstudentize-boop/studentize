import { StudentIcon, XIcon } from "@phosphor-icons/react";
import { Dialog, DialogClose } from "@/components/dialog";
import { Button } from "@/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "orpc/client";
import { useState } from "react";

export const ApproveStudentDialog = ({ userId }: { userId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const approveMutation = useMutation(
    orpc.user.approve.mutationOptions({
      onSuccess: () => {
        setIsOpen(false);

        queryClient.invalidateQueries({
          queryKey: orpc.user.listPending.key({ type: "query" }),
        });
      },
    })
  );

  const handleApprove = () => {
    approveMutation.mutate({
      userId,
      role: "STUDENT",
    });
  };

  return (
    <Dialog
      trigger={
        <button className="px-3 py-1.5 rounded-lg border border-zinc-200 inline-flex gap-2 items-center text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-150 bg-white">
          Approve as Student
        </button>
      }
      className="p-0"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="p-4 border-b border-bzinc flex items-center justify-between">
        <div>Approve as Student</div>
        <DialogClose>
          <Button variant="neutral">
            <XIcon />
          </Button>
        </DialogClose>
      </div>
      <div className="px-6 pt-4 pb-8">
        <p className="text-sm text-zinc-700">
          Are you sure you want to approve this user as a student? This will
          activate their account and grant them student access.
        </p>
      </div>
      <div className="p-4 bg-zinc-100 border-t border-bzinc flex justify-end">
        <Button
          variant="primary"
          onClick={handleApprove}
          isLoading={approveMutation.isPending}
        >
          Approve
          <StudentIcon size={18} />
        </Button>
      </div>
    </Dialog>
  );
};
