import { cn } from "@/utils/cn";
import ReactMarkdown from "react-markdown";

export const Markdown = ({
  children,
  className,
}: {
  children: string | null | undefined;
  className?: string;
}) => {
  return (
    <div className={cn("whitespace-pre-wrap break-words", className)}>
      <ReactMarkdown
        components={{
          ul: (props) => (
            <ul
              {...props}
              className="leading-tight list-inside list-disc -my-2"
            />
          ),
          ol: (props) => (
            <ol
              {...props}
              className="leading-tight list-inside list-decimal -my-2"
            />
          ),
          strong: (props) => <strong {...props} className="font-semibold" />,
          em: (props) => <em {...props} className="italic" />,
          u: (props) => <u {...props} className="underline" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
