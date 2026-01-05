import { Loader } from "@/components/loader";
import { Markdown } from "@/components/markdown";
import { Repeat } from "@/components/repeat";
import { cn } from "@/utils/cn";
import { SparkleIcon, SubtitlesIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "orpc/client";

const Card = ({
  title,
  children,
  variant = "violet",
}: {
  title: string;
  children: string;
  variant?: "violet" | "zinc";
}) => {
  const Icon = variant === "violet" ? SparkleIcon : SubtitlesIcon;

  return (
    <div
      className={cn(
        "p-2 border rounded-lg flex flex-col gap-2",
        variant === "violet"
          ? "border-violet-200 bg-violet-50/40"
          : "border-zinc-200 bg-zinc-50/40"
      )}
    >
      <div>
        <div
          className={cn(
            "rounded-md border bg-white inline-flex items-center py-0.5 px-1 gap-2",
            variant === "violet" ? "border-violet-200" : "border-zinc-200"
          )}
        >
          <Icon
            weight="fill"
            className={cn(
              variant === "violet" ? "text-violet-800" : "text-zinc-800"
            )}
          />
          <div
            className={cn(
              variant === "violet" ? "text-violet-950" : "text-zinc-950"
            )}
          >
            {title}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "px-0.5 mt-1.5",
          variant === "violet" ? "text-violet-950" : "text-zinc-950"
        )}
      >
        <Markdown>{children}</Markdown>
      </div>
    </div>
  );
};

export const UserSessionsTab = ({
  studentUserId,
}: {
  studentUserId: string;
}) => {
  const summaryQuery = useQuery(
    orpc.session.summaryList.queryOptions({ input: { studentUserId } })
  );

  const session = summaryQuery.data;

  const isPendingOrError = summaryQuery.isPending || summaryQuery.isError;

  return (
    <div className="rounded-md p-4 pr-2.5 flex flex-col gap-4">
      {isPendingOrError ? (
        <Repeat
          component={
            <div className="rounded-lg border border-bzinc p-2">
              <Loader className="h-6 w-32 mb-2" />

              <Loader />
              <Loader className="mt-1 w-3/4" />
              <Loader className="mt-1 w-1/4" />
            </div>
          }
          times={4}
        />
      ) : null}

      {!isPendingOrError ? (
        <>
          {session?.overview ? (
            <Card title="User Summary">{session?.overview}</Card>
          ) : null}

          {session?.summaries.map((s) => (
            <Card title={s.title} variant="zinc">
              {s.summary ?? ""}
            </Card>
          ))}
        </>
      ) : null}
    </div>
  );
};
