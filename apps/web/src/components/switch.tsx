import { Switch as SwitchPrimitive } from "radix-ui";

export const Switch = (props: SwitchPrimitive.SwitchProps) => {
  return (
    <SwitchPrimitive.Root
      {...props}
      className="relative h-[25px] w-[42px] cursor-default bg-zinc-300 rounded-full outline-none focus:shadow-[0_0_0_2px] data-[state=checked]:bg-zinc-300"
    >
      <SwitchPrimitive.Thumb className="block size-[21px] translate-x-0.5 rounded-full bg-zinc-800 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]" />
    </SwitchPrimitive.Root>
  );
};
