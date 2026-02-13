import { createFileRoute } from "@tanstack/react-router";

import { VirtualAdvisorCard } from "@/features/virtual-advisor-card";

export const Route = createFileRoute(
  "/_authenticated/student/virtual-advisors/"
)({
  component: RouteComponent,
});

export const virtualAdvisors = [
  {
    name: "Zain",
    university: "Warwick University",
    logo: "https://studentize.com/images/university_logos/warwick_logo.png",
    src: "https://studentize.com/images/Zain.png",
    slug: "zain",
  },
  {
    name: "John",
    university: "LSE",
    logo: "https://studentize.com/images/university_logos/lse_logo.png",
    src: "https://studentize.com/images/John.png",
    slug: "john",
  },
  {
    name: "Ron",
    university: "Virginia Tech",
    logo: "https://studentize.com/images/university_logos/vt.png",
    src: "https://studentize.com/images/Ron.png",
    slug: "ron",
  },
];

function RouteComponent() {
  return (
    <div className="flex-1 flex p-4 gap-4">
      {virtualAdvisors.map((advisor) => (
        <VirtualAdvisorCard
          key={advisor.name}
          logo={advisor.logo}
          src={advisor.src}
          name={advisor.name}
          university={advisor.university}
        />
      ))}
    </div>
  );
}
