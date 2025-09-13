import {
  DropdownContent,
  DropdownPortal,
  DropdownRoot,
  DropdownTrigger,
  DropdownItem,
} from "@/components/dropdown";
import { cn } from "@/utils/cn";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Avvatar from "avvvatars-react";
import { RouterOutputs } from "orpc/client";

type User = RouterOutputs["student"]["search"][number];

export const UserSearch = ({
  align = "start",
  placeholder,
  onSelect,
  onSearch,
  data,
  user,
  trigger,
  side,
  className,
}: {
  placeholder: string;
  onSelect?: (user: User) => void;
  onSearch: (query: string) => void;
  data: Array<User>;
  align?: "start" | "end";
  side?: "top" | "bottom" | "left" | "right";
  user?: User;
  trigger?: (user: User | undefined) => React.ReactNode;
  className?: string;
}) => {
  return (
    <DropdownRoot>
      <DropdownTrigger disabled={!onSelect} asChild>
        {trigger ? (
          trigger(user)
        ) : (
          <button className="border border-zinc-200 rounded-lg inline-flex items-center w-full cursor-pointer">
            <div className="p-2 border-r border-zinc-200/80">
              {user ? (
                <Avvatar size={20} value={user?.name ?? ""} style="shape" />
              ) : (
                <div className="size-5" />
              )}
            </div>
            <div className="px-2">{user?.name}</div>
          </button>
        )}
      </DropdownTrigger>
      <DropdownPortal>
        <DropdownContent
          side={side}
          align={align}
          className={cn("p-0 pb-2 w-[29.2rem]", className)}
        >
          <div className="py-2 px-2.5 border-b border-bzinc flex gap-2.5 items-center">
            <MagnifyingGlassIcon
              size={17}
              weight="bold"
              className="text-zinc-600"
            />
            <input
              className="w-full outline-none"
              placeholder={placeholder}
              autoFocus
              onChange={(ev) => onSearch(ev.target.value)}
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar h-48">
            <div className="pb-10">
              {data.length > 0
                ? data.map((d) => (
                    <DropdownItem onSelect={() => onSelect?.(d)} key={d.userId}>
                      <Avvatar value={d.name ?? ""} size={20} style="shape" />
                      <div>{d.name}</div>
                    </DropdownItem>
                  ))
                : null}
            </div>
          </div>
        </DropdownContent>
      </DropdownPortal>
    </DropdownRoot>
  );
};
