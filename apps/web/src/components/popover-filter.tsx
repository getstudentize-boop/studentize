import * as Ariakit from "@ariakit/react";
import { ReactNode, useState } from "react";
import { cn } from "@/utils/cn";

export type PopoverFilterProps<I = unknown> = {
  children: ReactNode;
  items: I[];
  valueAccessor: (item: I) => string;
  idAccessor?: (item: I) => string;
  renderItem: (item: I, idx: number) => ReactNode;
  placeholder?: string;
  className?: string;
  onSelect: (item: I) => void;
  onSearch?: (query: string) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
};

export const PopoverFilter = <T,>({
  children,
  items,
  renderItem,
  valueAccessor,
  idAccessor,
  className,
  placeholder = "Search...",
  onSelect,
  onSearch,
  isDisabled,
  isLoading,
}: PopoverFilterProps<T>) => {
  const [search, setSearch] = useState("");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const filteredItems = onSearch
    ? items
    : search
      ? items.filter((item) =>
          valueAccessor(item).toLowerCase().includes(search.toLowerCase())
        )
      : items;

  return (
    <Ariakit.ComboboxProvider>
      <Ariakit.MenuProvider>
        <Ariakit.MenuButton disabled={isDisabled} className="w-full">
          {children}
        </Ariakit.MenuButton>
        <Ariakit.Menu
          gutter={5}
          className={cn(
            "bg-white border border-zinc-200 rounded-lg shadow-sm z-10",
            className
          )}
        >
          <div className="px-3 py-2 border-b border-bzinc flex items-center gap-2">
            <Ariakit.Combobox
              className="outline-none bg-transparent flex-1"
              placeholder={placeholder}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {isLoading && (
              <div className="size-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
            )}
          </div>
          <Ariakit.ComboboxList className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
            {filteredItems.map((item, idx) => {
              const value = valueAccessor(item);
              const id = idAccessor ? idAccessor(item) : value;

              return (
                <Ariakit.ComboboxItem
                  className="data-[active-item]:bg-white cursor-pointer active:bg-white data-[active]:bg-white rounded-[5px] transition-colors duration-200"
                  key={id}
                  focusOnHover
                  setValueOnClick={false}
                  onClick={() => onSelect(item)}
                  value={value}
                >
                  {renderItem(item, idx)}
                </Ariakit.ComboboxItem>
              );
            })}
          </Ariakit.ComboboxList>
        </Ariakit.Menu>
      </Ariakit.MenuProvider>
    </Ariakit.ComboboxProvider>
  );
};

export const PopoverFilterItem = Ariakit.ComboboxItem;
