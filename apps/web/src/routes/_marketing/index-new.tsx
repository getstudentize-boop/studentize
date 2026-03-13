import { Button } from "@/components/button";
import { cn } from "@/utils/cn";
import {
  ArrowRightIcon,
  BrainIcon,
  CheckIcon,
  XIcon,
  SparkleIcon,
  PlusIcon,
  HouseIcon,
  StarIcon,
  FileText,
  ShieldCheck,
  Lock,
  EnvelopeIcon,
} from "@phosphor-icons/react";
import { SpeakToAdvisor } from "@/components/SpeakToAdvisor";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_marketing/index-new")({
  component: RouteComponent,
});

const ToolsCard = () => {
  return (
    <div className="border-r first:border-l border-bzinc flex flex-col gap-4 justify-center items-center p-10">
      <div className="rounded-full bg-cyan-600 px-3 py-0.5 text-white shadow flex items-center gap-2.5">
        <SparkleIcon weight="fill" className="size-4 text-cyan-100" />
        Included
      </div>
      <div>
        <BrainIcon weight="fill" className="size-16 text-cyan-950" />
      </div>
      <div className="font-semibold">Profile Understanding</div>
      <div className="text-center">
        Personalized academic direction through aptitude testing and advisor
        sessions to discover strengths and potential paths.
      </div>
    </div>
  );
};

const FAQ_ITEMS = [
  {
    question: "How is Studentize different from traditional counseling?",
    answer:
      "Studentize connects you directly with current students and recent graduates from your dream universities. You get peer-to-peer guidance from people who've recently been through the process, plus AI-powered tools to streamline your applications.",
  },
  {
    question: "How is the quality of sessions ensured?",
    answer:
      "All our advisors are vetted students and graduates from top universities. Sessions are recorded for quality assurance, and we gather feedback to continuously improve. Our platform also provides structure and AI support to make every session productive.",
  },
  {
    question:
      "What is the difference between a Dedicated and a Specialist Advisor?",
    answer:
      "A Dedicated Advisor works with you throughout your journey, building deep understanding of your goals. A Specialist Advisor focuses on specific areas—like essay review or interview prep—when you need targeted support. Many students use both.",
  },
  {
    question: "What are the costs?",
    answer:
      "We are completely transparent in our fee structure, and charge a platform fee + mentor fee to cover our costs. However, if you are accessing Studentize through a partner school, then it is completely free!",
  },
];

const FaqAccordion = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(3);

  return (
    <div className="flex flex-col gap-2">
      {FAQ_ITEMS.map((item, index) => {
        const isExpanded = expandedIndex === index;
        return (
          <div
            key={index}
            className={cn(
              "rounded-lg border transition-colors",
              isExpanded
                ? "bg-white border-zinc-200 shadow-sm"
                : "bg-zinc-100 border-zinc-200 hover:bg-zinc-50",
            )}
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="w-full flex items-center justify-between gap-4 p-4 text-left"
            >
              <span
                className={cn(
                  "font-semibold",
                  isExpanded ? "text-cyan-700" : "text-zinc-900",
                )}
              >
                {item.question}
              </span>
              {isExpanded ? (
                <XIcon
                  className="size-5 shrink-0 text-cyan-600"
                  weight="bold"
                />
              ) : (
                <PlusIcon
                  className="size-5 shrink-0 text-zinc-700"
                  weight="bold"
                />
              )}
            </button>
            {isExpanded && (
              <div className="border-l-2 border-cyan-600 pl-4 mx-4 mb-4 text-zinc-600 text-sm leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ComparisonItem = ({ variant }: { variant: "check" | "x" }) => {
  const Icon = variant === "check" ? CheckIcon : XIcon;

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-44">
      <div>
        <div
          className={cn(
            "rounded-full p-2 bg-green-600 text-white",
            variant === "check" ? "bg-green-600" : "bg-red-600",
          )}
        >
          <Icon className="size-3" weight="bold" />
        </div>
      </div>
      <div className="text-center">
        Step-by-step support with advisors from your dream universities globally
        who have recently been through the process!
      </div>
    </div>
  );
};

function RouteComponent() {
  return (
    <div className="text-base space-y-20">
      <div className="h-screen p-4 flex flex-col relative">
        <div className="flex-1 relative rounded-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="object-cover w-full absolute top-0 left-0"
          />
          <div className="h-full bg-linear-to-b from-black to-cyan-950/80 backdrop-blur-xs flex flex-col justify-end">
            <div className="flex flex-col h-full space-y-10 justify-between">
              <div className="p-4 flex items-center justify-between">
                <img src="/logo.png" alt="Studentize Logo" className="w-14" />
                <div className="text-white flex gap-4">
                  <div>Home</div>
                  <div>About Us</div>
                  <div>Why Studentize?</div>
                  <div>FAQs</div>
                  <div>Contact</div>
                  <div>More</div>
                </div>
                <Button>Sign In</Button>
              </div>
              <div className="pt-10 max-w-6xl mx-auto space-y-10 h-2/3">
                <div className="flex-1 flex items-end justify-between px-10">
                  <div>
                    <h1 className="text-white text-4xl font-semibold">
                      All-in-One Admissions Solution,
                      <br />
                      <i>
                        Powered by <u>Real Mentors.</u>
                      </i>
                    </h1>
                    <div className="text-3xl mt-4 max-w-2xl text-white">
                      End-to-end guidance from advisors at your dream university
                      in your dream course
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="neutral">
                      I'm a student
                      <ArrowRightIcon />
                    </Button>
                    <Button variant="primary">
                      I'm a parent
                      <ArrowRightIcon />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 bg-black rounded-xl shrink-0 h-1/3 max-w-6xl mx-auto">
                  <img
                    src="/screenshot.png"
                    alt="Studentize Logo"
                    className="w-full object-cover rounded-t-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-10 flex gap-10">
        <img
          src="https://studentize.com/images/university_logos/lse_logo.png"
          alt="LSE Logo"
          className="size-20 object-contain"
        />
        <img
          src="https://studentize.com/images/university_logos/NYU_Logo.png"
          alt="LSE Logo"
          className="size-20 object-contain"
        />
        <img
          src="https://studentize.com/images/university_logos/purdue_logo.png"
          alt="LSE Logo"
          className="size-20 object-contain"
        />
        <img
          src="https://studentize.com/images/university_logos/Yale_logo.png"
          alt="Yale Logo"
          className="size-20 object-contain"
        />
        <img
          src="https://studentize.com/images/university_logos/binghamton_logo.png"
          alt="Binghamton Logo"
          className="size-20 object-contain"
        />
        <img
          src="https://studentize.com/images/university_logos/umass_logo.png"
          alt="Yale Logo"
          className="size-20 object-contain"
        />
      </div>
      <div className="max-w-6xl mx-auto px-10 text-2xl">
        Global Impact -{" "}
        <span className="text-zinc-600">
          Our global network connects students with opportunities around the
          world, bringing together
        </span>{" "}
        <b className="font-semibold text-blue-600">100+ advisors</b>,{" "}
        <b className="font-semibold text-violet-800">50+ universities</b>, and{" "}
        <b className="font-semibold">partners across 10+ countries</b> to help
        students access the guidance, education, and pathways they need to
        succeed.
      </div>
      <div className="max-w-7xl mx-auto gap-10 px-10 h-[60vh] flex">
        <div className="flex-1 relative rounded-2xl overflow-hidden">
          <img
            src="https://studentize.com/images/Advisor-pic_4.jpeg"
            className="object-cover w-full h-full absolute top-0 left-0"
          />
          <div className="bg-linear-to-b to-black/90 from-cyan-900/60 h-full flex flex-col justify-between p-10 relative">
            <div className="flex items-center gap-4">
              <img
                src="https://studentize.com/images/university_logos/imperial_logo.webp"
                alt="Studentize Logo"
                className="size-14 rounded-lg"
              />
              <div className="text-white">
                <div className="font-semibold">Raksha</div>
                <div>Imperial College London</div>
              </div>
            </div>
            <div>
              <div className="text-white text-2xl font-semibold mb-2">
                Meet our advisors
              </div>
              <div className="text-white text-xl">
                Learn from our network of 100+ students at the world's leading
                universities
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 relative rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="object-cover w-full h-full absolute top-0 left-0"
          />
          <div className="bg-linear-to-b to-black from-black/50 h-full flex flex-col justify-end p-10 relative">
            <div className="text-white text-2xl font-semibold mb-2">
              Meet our virtual advisors
            </div>
            <div className="text-white text-xl">
              Get personalized guidance from our virtual advisors
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 border-bzinc border-y ">
        <div className="max-w-6xl mx-auto grid grid-cols-3">
          {new Array(3).fill(0).map((_, index) => (
            <ToolsCard key={index} />
          ))}
        </div>
        <hr className="border-bzinc" />
        <div className="max-w-6xl mx-auto grid grid-cols-3">
          {new Array(3).fill(0).map((_, index) => (
            <ToolsCard key={index} />
          ))}
        </div>
      </div>

      <div>
        <div className="mx-auto rounded-xl max-w-4xl text-2xl text-center bg-cyan-800 text-white p-10 overflow-hidden">
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            <div className="font-semibold">
              Ready to start your university journey?
            </div>
            <div>
              Choose your path and begin with expert guidance tailored to your
              goals.
            </div>
            <div className="flex gap-4 justify-center mt-4">
              <Button variant="neutral">
                Learn More
                <ArrowRightIcon />
              </Button>
              <Button variant="primary">
                Get Started
                <ArrowRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 gap-4 flex">
        <div className="flex-[0.5]">
          <div className="h-15" />
          <div className="h-44 p-2 py-4 flex gap-4 items-center">
            <div className="border border-cyan-700 h-full" />
            <div>Real Guidance from Top Advisors</div>
          </div>
          <div className="h-44 p-2 py-4 flex gap-4 items-center">
            <div className="border border-cyan-700 h-full" />
            <div>AI-Powered Platform</div>
          </div>
          <div className="h-44 p-2 py-4 flex gap-4 items-center">
            <div className="border border-cyan-700 h-full" />
            <div>Tailored University Guidance</div>
          </div>
          <div className="h-44 p-2 py-4 flex gap-4 items-center">
            <div className="border border-cyan-700 h-full" />
            <div>Affordable Pricing</div>
          </div>
        </div>
        <div className="rounded-xl border-cyan-800 text-white border bg-cyan-950 flex-1">
          <div className="border-b border-cyan-900 p-4 text-center">
            <div className="font-semibold">Studentize</div>
          </div>

          <ComparisonItem variant="check" />
          <ComparisonItem variant="check" />
          <ComparisonItem variant="check" />
        </div>
        <div className="rounded-xl border-bzinc border flex-1 overflow-hidden">
          <div className="border-b border-bzinc p-4 text-center bg-zinc-50">
            <div className="font-semibold">The generic counsler</div>
          </div>

          <ComparisonItem variant="x" />
          <ComparisonItem variant="x" />
          <ComparisonItem variant="x" />
        </div>
      </div>

      <div
        id="why-studentize"
        className="border-y border-bzinc text-2xl bg-zinc-50"
      >
        <div className="max-w-6xl mx-auto flex">
          <div className="flex-1 sticky top-0 p-10">
            <div className="text-cyan-600 text-xl">Why Choose Us</div>
            <div>Why studentize?</div>
          </div>

          <div className="flex-1 border-l border-bzinc p-14 sticky flex flex-col gap-10">
            <div>
              <div className="font-semibold">Peer-to-Peer Connection</div>
              <div className="mt-2">
                Learn directly from graduates and students from top universities
                who've been in your shoes.
              </div>
            </div>
            <div>
              <div className="font-semibold">Peer-to-Peer Connection</div>
              <div className="mt-2">
                Learn directly from graduates and students from top universities
                who've been in your shoes.
              </div>
            </div>
            <div>
              <div className="font-semibold">Peer-to-Peer Connection</div>
              <div className="mt-2">
                Learn directly from graduates and students from top universities
                who've been in your shoes.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="faqs">
        <div className="max-w-6xl mx-auto px-10 py-10">
          <div className="flex items-start justify-between gap-8 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">
                Frequently Asked Questions
              </h2>
              <p className="mt-2">
                Find answers to common questions about our service
              </p>
              <div className="mt-2 h-0.5 w-32 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" />
            </div>
            <Button variant="primary" className="shrink-0">
              Refer Your School
              <ArrowRightIcon />
            </Button>
          </div>
          <div className="max-w-2xl">
            <FaqAccordion />
          </div>
          <p className="mt-8">
            Can&apos;t find the answer you&apos;re looking for?{" "}
            <a
              href="/contact"
              className="font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>

      <footer className="bg-zinc-900 text-white -mb-20">
        <div className="max-w-6xl mx-auto px-10 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="text-xl font-bold tracking-wider">STUDENTIZE</div>
            <p className="text-zinc-300 text-sm">
              Revolutionizing university admissions through peer-to-peer
              mentorship
            </p>
          </div>
          <div className="space-y-4">
            <div className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
              Resources
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="/index-new"
                className="flex items-center gap-2 rounded-lg bg-cyan-900/50 px-3 py-2 text-sm w-fit hover:bg-cyan-800/50"
              >
                <HouseIcon weight="duotone" className="size-4" />
                Home
              </a>
              <a
                href="/index-new#why-studentize"
                className="flex items-center gap-2 rounded-lg bg-cyan-900/50 px-3 py-2 text-sm w-fit hover:bg-cyan-800/50"
              >
                <StarIcon weight="duotone" className="size-4" />
                Why Studentize
              </a>
              <a
                href="/index-new#faqs"
                className="flex items-center gap-2 rounded-lg bg-cyan-900/50 px-3 py-2 text-sm w-fit hover:bg-cyan-800/50"
              >
                <FileText weight="duotone" className="size-4" />
                FAQs
              </a>
              <a
                href="/blog"
                className="flex items-center gap-2 rounded-lg bg-cyan-900/50 px-3 py-2 text-sm w-fit hover:bg-cyan-800/50"
              >
                <FileText weight="duotone" className="size-4" />
                Blog
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
              Information
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="/safeguarding"
                className="flex items-center gap-2 rounded-lg bg-cyan-900/50 px-3 py-2 text-sm w-fit hover:bg-cyan-800/50"
              >
                <ShieldCheck weight="duotone" className="size-4" />
                Safeguarding Policy
              </a>
              <a
                href="/terms"
                className="flex items-center gap-2 rounded-lg bg-cyan-900/50 px-3 py-2 text-sm w-fit hover:bg-cyan-800/50"
              >
                <FileText weight="duotone" className="size-4" />
                Terms & Conditions
              </a>
              <a
                href="/privacy"
                className="flex items-center gap-2 rounded-lg bg-cyan-900/50 px-3 py-2 text-sm w-fit hover:bg-cyan-800/50"
              >
                <Lock weight="duotone" className="size-4" />
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
              Contact
            </div>
            <a
              href="/contact"
              className="flex items-center gap-2 rounded-lg bg-cyan-900/50 px-3 py-2 text-sm w-fit hover:bg-cyan-800/50"
            >
              <EnvelopeIcon weight="duotone" className="size-4" />
              Contact Us
            </a>
            <p className="text-zinc-300 text-sm italic">
              &quot;Connecting students with top university mentors
              worldwide&quot;
            </p>
          </div>
        </div>
      </footer>

      <SpeakToAdvisor />
    </div>
  );
}
