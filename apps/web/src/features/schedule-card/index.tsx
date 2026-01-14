import { Button } from "@/components/button";
import {
  CalendarBlankIcon,
  ClockIcon,
  DotsThreeOutlineIcon,
  FloppyDiskBackIcon,
  GoogleLogoIcon,
  RobotIcon,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, RouterOutputs } from "orpc/client";

import { format as _format } from "date-fns";
import { Popover } from "@/components/popover";
import { DeleteSession } from "./delete";
import { Tooltip } from "@/components/tooltip";

export const ScheduleCard = ({
  session,
}: {
  session: RouterOutputs["scheduledSession"]["list"][number];
}) => {
  const utils = useQueryClient();

  const sendBotToMeetingMutation = useMutation(
    orpc.scheduledSession.sendBotToMeeting.mutationOptions({})
  );

  const endMeetingMutation = useMutation(
    orpc.scheduledSession.endMeeting.mutationOptions({
      onSuccess: () => {
        utils.invalidateQueries({
          queryKey: orpc.scheduledSession.list.queryKey(),
        });
      },
    })
  );

  return (
    <div className="rounded-xl bg-white border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="font-semibold text-lg mb-1 text-zinc-900 truncate">
          {session.title}
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex gap-2 items-center text-sm text-zinc-700">
            <CalendarBlankIcon className="size-4 text-zinc-400" />
            <div>
              {_format(new Date(session.scheduledAt), "eeee MMMM d, yyyy")}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="flex gap-2 items-center text-sm text-zinc-700">
              <ClockIcon className="size-4 text-zinc-400" />
              <div>{_format(new Date(session.scheduledAt), "h:mm a")}</div>
              {!!session.googleEventId ? (
                <>
                  <div className="bg-zinc-300 w-[1px] h-4 rounded-full" />
                  <div className="flex gap-2 items-center text-green-600 font-medium">
                    <GoogleLogoIcon weight="bold" className="size-4" />
                    <div className="text-xs">Synced</div>
                  </div>
                </>
              ) : null}
            </div>

            <Popover
              trigger={<DotsThreeOutlineIcon weight="fill" className="text-zinc-600 hover:text-zinc-900 transition-colors" />}
              className="flex flex-col gap-2 rounded-lg"
              align="end"
            >
              <Button
                variant="neutral"
                className="rounded-lg"
                onClick={() =>
                  sendBotToMeetingMutation.mutate({
                    scheduledSessionId: session.id,
                  })
                }
                isLoading={sendBotToMeetingMutation.isPending}
              >
                <RobotIcon />
                Send bot to session
              </Button>
              <DeleteSession scheduledSessionId={session.id} />

              {session.botId ? (
                <>
                  <hr className="border border-zinc-200" />

                  <Button
                    variant="primary"
                    className="rounded-lg"
                    isLoading={endMeetingMutation.isPending}
                    onClick={() =>
                      endMeetingMutation.mutate({
                        scheduledSessionId: session.id,
                      })
                    }
                  >
                    End meeting
                  </Button>
                </>
              ) : null}
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center p-4 border-t border-bzinc">
        <Tooltip
          trigger={
            <button
              className="p-2 rounded-md border border-bzinc bg-zinc-50 transition-colors"
              onClick={() => {
                utils.invalidateQueries({
                  queryKey: orpc.scheduledSession.list.queryKey(),
                });
              }}
            >
              <RobotIcon
                size={18}
                className={session.botId ? "text-indigo-600" : ""}
              />
            </button>
          }
        >
          {session.botId}
        </Tooltip>
        <Button
          variant="primary"
          className="rounded-lg w-full"
          onClick={() => {
            window.open(
              `https://meet.google.com/${session.meetingCode}`,
              "_blank"
            );
          }}
        >
          Join Meeting
        </Button>
      </div>
    </div>
  );
};
