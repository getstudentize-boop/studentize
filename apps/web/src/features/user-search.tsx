import {
  DropdownContent,
  DropdownPortal,
  DropdownRoot,
  DropdownTrigger,
  DropdownItem,
} from "@/components/dropdown";
import { Loader } from "@/components/loader";
import { PopoverFilter } from "@/components/popover-filter";
import { Repeat } from "@/components/repeat";
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
  isLoading,
  isTriggerDisabled,
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
  isLoading?: boolean;
  isTriggerDisabled?: boolean;
}) => {
  return (
    <PopoverFilter
      items={data}
      isDisabled={isTriggerDisabled}
      renderItem={({ name }, idx) => (
        <div
          className={cn("p-2 border-t border-bzinc text-left", {
            "border-t-0": idx === 0,
          })}
        >
          {name}
        </div>
      )}
      valueAccessor={(item) => item.name ?? ""}
      onSelect={(user) => onSelect?.(user)}
    >
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
    </PopoverFilter>
  );
};
