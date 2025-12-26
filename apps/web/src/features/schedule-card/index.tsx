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
    orpc.scheduledSession.endMeeting.mutationOptions()
  );

  return (
    <div className="rounded-lg bg-white outline outline-bzinc">
      <div className="p-4">
        <div className="font-semibold text-lg px-2 truncate">
          {session.title}
        </div>

        <div className="mt-4 space-y-2 px-2">
          <div className="flex gap-2 items-center">
            <CalendarBlankIcon className="size-4 text-zinc-500" />
            <div>
              {_format(new Date(session.scheduledAt), "eeee MMMM d, yyyy")}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="flex gap-2 items-center">
              <ClockIcon className="size-4 text-zinc-500" />
              <div>{_format(new Date(session.scheduledAt), "h:mm a")}</div>
              {!!session.googleEventId ? (
                <>
                  <div className="bg-zinc-400 w-[1px] h-4 rounded-full" />
                  <div className="flex gap-2 items-center text-green-600">
                    <GoogleLogoIcon weight="bold" />
                    <div>Synced</div>
                  </div>
                </>
              ) : null}
            </div>

            <Popover
              trigger={<DotsThreeOutlineIcon weight="fill" />}
              className="flex flex-col gap-2 rounded-lg"
              align="end"
            >
              <Button
                variant="neutral"
                className="rounded-md"
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

              <hr className="border border-bzinc" />

              <Button
                className="rounded-md"
                isLoading={endMeetingMutation.isPending}
                onClick={() =>
                  endMeetingMutation.mutate({ scheduledSessionId: session.id })
                }
              >
                End meeting
              </Button>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center p-4 border-t border-bzinc">
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
        <Button
          variant="neutral"
          className="rounded-md w-full"
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
