import { createFileRoute } from "@tanstack/react-router";

import { VirtualAdvisorCard } from "@/features/virtual-advisor-card";
import {
  GraduationCapIcon,
  PencilIcon,
  StudentIcon,
} from "@phosphor-icons/react";

export const Route = createFileRoute(
  "/_authenticated/student/virtual-advisors/",
)({
  component: RouteComponent,
});

export const virtualAdvisors = [
  {
    name: "Zara",
    subtitle: "University Shortlisting",
    description:
      "Build your university shortlist with reach, target, and safety schools based on your profile.",
    logo: GraduationCapIcon,
    src: "/zara.png",
    slug: "shortlister",
  },
  {
    name: "Marcus",
    subtitle: "Application Essays",
    description:
      "Get direct feedback on your personal statements, Common App essays, and supplementals.",
    logo: PencilIcon,
    src: "/marcus.png",
    slug: "essaycoach",
  },
  {
    name: "Kai",
    subtitle: "SAT Tutor",
    description:
      "Practice SAT questions, learn strategies, and improve your weak areas with a personal tutor.",
    logo: StudentIcon,
    src: "/kai.png",
    slug: "sattutor",
  },
];

function RouteComponent() {
  return (
    <div className="flex-1 flex p-4 gap-4">
      {virtualAdvisors.map((advisor) => (
        <VirtualAdvisorCard
          key={advisor.slug}
          logo={advisor.logo}
          src={advisor.src}
          name={advisor.name}
          subtitle={advisor.subtitle}
          slug={advisor.slug}
        />
      ))}
    </div>
  );
}
