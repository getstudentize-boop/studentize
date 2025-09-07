import { useAutosizeTextArea } from "@/hooks/use-autosize-text-area";
import { cn } from "@/utils/cn";
import { ComponentProps, useRef } from "react";

type AutosizeTextAreaProps = ComponentProps<"textarea"> & {
  value: string;
  onValueChange: (value: string) => void;
};

export const AutosizeTextArea = ({
  value,
  onValueChange,
  ...props
}: AutosizeTextAreaProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(textAreaRef.current, value);

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    onValueChange(val);
  };

  return (
    <textarea
      {...props}
      ref={textAreaRef}
      className={cn(
        "w-full outline-none resize-none min-h-10",
        props.className
      )}
      onChange={handleChange}
      value={value}
    />
  );
};
