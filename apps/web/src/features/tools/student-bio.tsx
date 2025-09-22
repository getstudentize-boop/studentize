import { Button } from "@/components/button";
import { Dialog } from "@/components/dialog";
import { ArrowUpRightIcon, UserSquareIcon } from "@phosphor-icons/react";
import { Link, useSearch } from "@tanstack/react-router";

export const StudentBioTool = ({ output = {} }: { output: any }) => {
  const search = useSearch({ from: "/_authenticated/guru" });

  return (
    <Dialog
      trigger={
        <button className="rounded-md shadow-sm outline outline-bzinc py-1 px-2 inline-flex gap-2 items-center cursor-pointer">
          <UserSquareIcon />
          <div>Student Bio</div>
        </button>
      }
      className="p-0"
    >
      <div className="px-4 py-3 border-bzinc border-b flex gap-4 items-center">
        <UserSquareIcon />
        Student Bio Tool Content
      </div>
      <div className="px-4 py-2">
        <div className="flex flex-col gap-4 p-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-semibold">Name</div>
              <div>{output.name}</div>
            </div>
            <div>
              <div className="font-semibold">Email</div>
              <div>{output.email}</div>
            </div>
            <div>
              <div className="font-semibold">Curriculum</div>
              <div>{output.studyCurriculum}</div>
            </div>
            <div>
              <div className="font-semibold">Expected Gradution Year</div>
              <div>{output.expectedGraduationYear}</div>
            </div>
          </div>
          <div>
            <div>
              <div className="font-semibold mb-2">Area's of interest</div>
              <div className="-translate-x-1">
                {output.areasOfInterest?.map((area: any) => (
                  <Button
                    key={area}
                    className="inline-block mr-2 mb-2"
                    variant="primaryLight"
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <div className="font-semibold mb-2">Target Universities</div>
              <div className="-translate-x-1">
                {output.targetCountries?.map((university: any) => (
                  <Button
                    key={university}
                    className="inline-block mr-2 mb-2"
                    variant="primaryLight"
                  >
                    {university}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/students/$userId"
          target="_blank"
          rel="noopener noreferrer"
          params={{ userId: search.userId ?? "" }}
        >
          <Button className="w-full rounded-md gap-4 mt-2 mb-4">
            View User's Profile
            <ArrowUpRightIcon className="size-4" />
          </Button>
        </Link>
      </div>
    </Dialog>
  );
};
