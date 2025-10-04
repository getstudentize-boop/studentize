import { Button } from "@/components/button";
import { useSessionSummary } from "@/hooks/use-session-summary";
import { SparkleIcon } from "@phosphor-icons/react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/icons/ArrowLeft";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import Avvatar from "avvvatars-react";
import { orpc } from "orpc/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/sessions/$sessionId")({
  component: RouteComponent,
});

export const UserCard = ({
  title,
  userId,
}: {
  title: string;
  userId: string;
}) => {
  const userQuery = useQuery(
    orpc.user.getOne.queryOptions({ input: { userId } })
  );

  const user = userQuery.data;

  return (
    <div>
      <div className="mb-2 font-semibold">{title}</div>
      {userQuery.isPending ? (
        <div className="rounded-md border border-bzinc flex items-center">
          <div className="p-2 border-r border-bzinc">
            <div className="h-5 w-5 bg-zincLoading rounded-md animate-pulse" />
          </div>
          <div className="px-2">
            <div className="h-4 w-40 bg-zincLoading rounded-md animate-pulse" />
          </div>
        </div>
      ) : null}
      {user ? (
        <div className="flex items-center gap-2 border border-bzinc rounded-md">
          <div className="p-2 border-r border-bzinc">
            <Avvatar size={20} value={user.name ?? ""} style="shape" />
          </div>
          <div>{user.name}</div>
        </div>
      ) : null}
    </div>
  );
};

const SummarizeAction = ({
  sessionId,
  summary,
  onRefresh,
}: {
  sessionId: string;
  summary: string;
  onRefresh: () => void;
}) => {
  const [isGenerationCalled, setIsGenerationCalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { startSessionSummaryGeneration } = useSessionSummary();

  useEffect(() => {
    setIsGenerationCalled(false);
  }, [sessionId]);

  return (
    <div className="border-t border-bzinc text-left p-4">
      <div className="border border-bzinc rounded-lg bg-gradient-to-t to-zinc-100 white-white">
        <div className="px-4 py-2 border-b border-bzinc">Summary</div>
        <div className="p-4">
          {summary}
          {!summary && !isGenerationCalled ? (
            <div className="h-14 flex items-center justify-center">
              <div>
                <Button
                  className="rounded-md w-full"
                  variant="primaryLight"
                  isLoading={isLoading}
                  onClick={async () => {
                    setIsLoading(true);

                    await startSessionSummaryGeneration({ sessionId });
                    setIsGenerationCalled(true);
                    setIsLoading(false);
                  }}
                >
                  <SparkleIcon /> Generate Summary
                </Button>
              </div>
            </div>
          ) : null}
          {!summary && isGenerationCalled ? (
            <div className="text-center text-zinc-600 px-4">
              A generation request has been sent. It may take up to a minute to
              complete.{" "}
              <button
                className="font-semibold underline hover:no-underline cursor"
                onClick={() => onRefresh()}
              >
                Refresh
              </button>{" "}
              the page when it's ready.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

function RouteComponent() {
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);

  const { sessionId } = Route.useParams();

  const utils = useQueryClient();

  const sessionQuery = useQuery(
    orpc.session.getOne.queryOptions({ input: { sessionId } })
  );

  const updateSessionMutation = useMutation(
    orpc.session.update.mutationOptions({
      onSuccess: () => {
        return Promise.all([
          utils.invalidateQueries({
            queryKey: orpc.session.getOne.key({ input: { sessionId } }),
          }),
          utils.invalidateQueries({
            queryKey: orpc.session.list.key(),
          }),
        ]);
      },
      onError: () => {
        if (sessionQuery.data?.createdAt) {
          setCreatedAt(
            new Date(sessionQuery.data.createdAt).toISOString().split("T")[0]
          );
        }
      },
    })
  );

  const session = sessionQuery.data;

  useEffect(() => {
    if (session?.createdAt) {
      setCreatedAt(new Date(session.createdAt).toISOString().split("T")[0]);
    }
  }, [session?.createdAt]);

  return (
    <form
      onSubmit={async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      }}
      className="w-[500px] border-l border-bzinc bg-white"
    >
      <div className="flex gap-4 items-center px-4 pt-7 pb-4 border-b border-bzinc">
        <ArrowLeftIcon />
        <div>
          <div className="font-semibold">Update Session</div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4 text-left">
        <div className="flex flex-col gap-2">
          <div className="font-semibold">Title</div>
          <div>{session?.title}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <UserCard title="Students" userId={session?.studentUserId ?? ""} />
          <UserCard title="Advisors" userId={session?.advisorUserId ?? ""} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <div className="font-semibold">Created At</div>
            <input
              className="w-full border border-bzinc rounded-md p-2 mt-2"
              type="date"
              value={createdAt}
              onChange={(ev) => setCreatedAt(ev.target.value)}
            />
          </div>
        </div>

        <Button
          className="mt-auto rounded-lg"
          type="submit"
          isLoading={updateSessionMutation.isPending}
          onClick={() => {
            if (!createdAt) return;

            updateSessionMutation.mutate({
              sessionId,
              createdAt: new Date(createdAt),
            });
          }}
        >
          Update
        </Button>
      </div>
      <SummarizeAction
        sessionId={sessionId}
        summary={session?.summary ?? ""}
        onRefresh={() => {
          utils.invalidateQueries({
            queryKey: orpc.session.getOne.queryKey({ input: { sessionId } }),
          });
        }}
      />
    </form>
  );
}
