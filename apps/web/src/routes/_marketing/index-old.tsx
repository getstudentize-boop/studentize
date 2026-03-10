import { Button } from "@/components/button";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/index-old")({
  component: RouteComponent,
});

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
        <div className="rounded-2xl bg-zinc-900 flex-1 flex flex-col justify-end p-10">
          <div className="text-white text-2xl font-semibold">
            Meet our advisors
          </div>
        </div>
        <div className="rounded-2xl bg-zinc-900 flex-1 flex flex-col justify-end p-10">
          <div className="text-white text-2xl font-semibold">
            Meet our virtual advisors
          </div>
        </div>
      </div>
    </div>
  );
}
