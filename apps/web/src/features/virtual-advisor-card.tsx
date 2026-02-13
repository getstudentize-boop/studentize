import { cn } from "@/utils/cn";
import { Link } from "@tanstack/react-router";

export const VirtualAdvisorCard = ({
  src,
  name,
  university,
  logo,
  isSelected,
}: {
  src: string;
  name: string;
  university: string;
  logo: string;
  isSelected?: boolean;
}) => {
  return (
    <Link
      to="/student/virtual-advisors/$advisor"
      params={{ advisor: name.toLowerCase() }}
      className="rounded-xl border border-zinc-200 bg-white flex-1 overflow-hidden relative text-left group"
    >
      <img
        src={src}
        alt="Virtual Advisor"
        className="w-full h-full object-cover"
      />

      <div
        className={cn(
          "absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-30% to-90% from-black/50 to-transparent flex items-end justify-between text-white p-8 group-hover:from-black/95 transition-colors duration-500",
          {
            "from-black/95": isSelected,
          }
        )}
      >
        <div>
          <div className="text-lg font-semibold">{name}</div>
          <div>{university}</div>
        </div>
        <div className="flex gap-1">
          <div className="rounded-2xl bg-white size-14 flex items-center justify-center">
            <img src={logo} alt={university} className="w-10" />
          </div>
        </div>
      </div>
    </Link>
  );
};
