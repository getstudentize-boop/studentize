import { SessionTranscription } from "@/features/session-transcription";
import { UpdateSession } from "@/features/update-session";
import { cn } from "@/utils/cn";
import { PencilSimpleIcon, XIcon } from "@phosphor-icons/react";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/icons/ArrowLeft";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { orpc } from "orpc/client";
import { useState, useTransition } from "react";
import z from "zod";

export const Route = createFileRoute("/_authenticated/sessions/$sessionId")({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        tab: z.enum(["general", "transcription"]).default("general").optional(),
      })
      .parse(search),
});

function RouteComponent() {
  const { sessionId } = Route.useParams();
  const navigate = Route.useNavigate();

  const utils = useQueryClient();

  const [isPending, startTransition] = useTransition();

  const [isEditing, setIsEditing] = useState(false);

  const deleteMutation = useMutation(orpc.session.delete.mutationOptions());

  const { tab } = Route.useSearch();

  return (
    <form
      onSubmit={async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      }}
      className="w-[500px] border-l border-bzinc bg-white relative"
    >
      <div className="px-4 pt-7 border-b border-bzinc">
        <Link to="/sessions" className="flex gap-4 items-center">
          <ArrowLeftIcon />
          <div>
            <div className="font-semibold">Update Session</div>
          </div>
        </Link>
        <div className="flex">
          {(["general", "transcription"] as const).map((t) => (
            <Link key={t} to="." search={{ tab: t }}>
              <button
                className={cn(
                  "p-4 pb-2 border-b-2 border-white cursor-pointer",
                  {
                    "border-black": tab === t,
                  }
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            </Link>
          ))}

          {tab === "transcription" ? (
            <button className="ml-2" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <XIcon /> : <PencilSimpleIcon />}
            </button>
          ) : null}

          <button
            className="ml-auto text-rose-800 p-4 pb-2 border-b-2 cursor-pointer"
            onClick={async () => {
              if (!confirm("Are you sure you want to delete this session?")) {
                return;
              }

              startTransition(async () => {
                await deleteMutation.mutateAsync({ sessionId });
                await utils.invalidateQueries({
                  queryKey: orpc.session.list.queryKey({ input: {} }),
                });

                navigate({ to: ".." });
              });
            }}
          >
            {isPending ? "..." : "Delete"}
          </button>
        </div>
      </div>
      {tab === "general" ? <UpdateSession sessionId={sessionId} /> : null}
      {tab === "transcription" ? (
        <SessionTranscription
          isEditing={isEditing}
          sessionId={sessionId}
          onClose={() => setIsEditing(false)}
        />
      ) : null}
    </form>
  );
}
