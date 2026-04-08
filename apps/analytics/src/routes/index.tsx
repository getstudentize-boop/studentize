import { createFileRoute } from "@tanstack/react-router";
import { ActiveStudents } from "#/stats/active-students";
import { ConversionRate } from "#/stats/conversion-rate";
import { FeatureAdoption } from "#/stats/feature-adoption";
import { GuruUsage } from "#/stats/guru-usage";
import { OnboardingCompletion } from "#/stats/onboarding-completion";
import { SessionRatings } from "#/stats/session-ratings";
import { ShortlistBreakdown } from "#/stats/shortlist-breakdown";
import { TaskCompletion } from "#/stats/task-completion";
import { DataChat } from "#/components/data-chat";

export const Route = createFileRoute("/")({ component: App });

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">{title}</h2>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function App() {
  return (
    <>
      <div className="mx-auto w-full max-w-6xl space-y-10 p-10 overflow-y-auto no-scrollbar">
        <Section title="Growth & Funnel">
          <OnboardingCompletion />
          <ActiveStudents />
          <ConversionRate />
          <FeatureAdoption />
        </Section>

        <Section title="University Research">
          <ShortlistBreakdown />
          <GuruUsage />
        </Section>

        <Section title="Advising & Progress">
          <SessionRatings />
          <TaskCompletion />
        </Section>
      </div>

      <DataChat />
    </>
  );
}
