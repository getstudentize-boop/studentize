import {
  DropdownContent,
  DropdownPortal,
  DropdownRoot,
  DropdownTrigger,
  DropdownItem,
} from "@/components/dropdown";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Avvatar from "avvvatars-react";

type User = { userId: string; name: string };

export const UserSearch = ({
  align = "start",
  placeholder,
  onSelect,
  onSearch,
  data,
  user,
}: {
  placeholder: string;
  onSelect: (user: User) => void;
  onSearch: (query: string) => void;
  data: Array<User>;
  align?: "start" | "end";
  user?: User;
}) => {
  return (
    <DropdownRoot>
      <DropdownTrigger asChild>
        <button className="border border-zinc-200 rounded-lg inline-flex items-center w-full cursor-pointer">
          <div className="p-2 border-r border-zinc-200/80">
            {user ? (
              <Avvatar size={24} value={user?.name} />
            ) : (
              <div className="size-6" />
            )}
          </div>
          <div className="px-2">{user?.name}</div>
        </button>
      </DropdownTrigger>
      <DropdownPortal>
        <DropdownContent align={align} className="p-0 pb-2 w-[29.2rem]">
          <div className="py-2 px-2.5 border-b border-bzinc mb-2 flex gap-2.5 items-center">
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
          {data.length > 0 ? (
            data.map((d) => (
              <DropdownItem onSelect={() => onSelect(d)} key={d.userId}>
                <Avvatar value={d.name} size={24} />
                <div>{d.name}</div>
              </DropdownItem>
            ))
          ) : (
            <div className="h-48" />
          )}
        </DropdownContent>
      </DropdownPortal>
    </DropdownRoot>
  );
};
