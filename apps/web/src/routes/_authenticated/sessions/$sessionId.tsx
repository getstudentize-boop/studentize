import { SessionTranscription } from "@/features/session-transcription";
import { UpdateSession } from "@/features/update-session";
import { cn } from "@/utils/cn";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/icons/ArrowLeft";
import { createFileRoute, Link } from "@tanstack/react-router";
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

  const { tab } = Route.useSearch();

  return (
    <form
      onSubmit={async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      }}
      className="w-[500px] border-l border-bzinc bg-white"
    >
      <div className="px-4 pt-7 border-b border-bzinc">
        <div className="flex gap-4 items-center">
          <ArrowLeftIcon />
          <div>
            <div className="font-semibold">Update Session</div>
          </div>
        </div>
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
        </div>
      </div>
      {tab === "general" ? <UpdateSession sessionId={sessionId} /> : null}
      {tab === "transcription" ? (
        <SessionTranscription sessionId={sessionId} />
      ) : null}
    </form>
  );
}
