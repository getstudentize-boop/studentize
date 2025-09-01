import {
  ArrowUpIcon,
  BrainIcon,
  CaretDownIcon,
  HeadsetIcon,
  SparkleIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/button";
import { ReactNode } from "react";

export const Header = ({ children }: { children: ReactNode }) => {
  return (
    <div className="text-center flex gap-4">
      <div className="border-r border-zinc-100 px-3.5 py-6 flex flex-col gap-6 items-center">
        <button className="p-2 bg-zinc-800 text-white rounded-full">
          <BrainIcon className="size-4" />
        </button>
        <HeadsetIcon className="size-4" />
        <UserIcon className="size-4" />
      </div>
      {children}
    </div>
  );
};
