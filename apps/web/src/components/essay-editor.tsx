import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import { cn } from "@/utils/cn";
import {
  TextBolderIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  QuotesIcon,
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
} from "@phosphor-icons/react";

interface EssayEditorProps {
  content: any;
  onUpdate: (content: any) => void;
  editable?: boolean;
  className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-200 bg-zinc-50">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200 disabled:opacity-30",
          editor.isActive("bold") && "bg-zinc-200",
        )}
      >
        <TextBolderIcon className="size-4" weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200 disabled:opacity-30",
          editor.isActive("italic") && "bg-zinc-200",
        )}
      >
        <TextItalicIcon className="size-4" weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200 disabled:opacity-30",
          editor.isActive("strike") && "bg-zinc-200",
        )}
      >
        <TextStrikethroughIcon className="size-4" weight="bold" />
      </button>
      <div className="w-px h-8 bg-zinc-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200",
          editor.isActive("bulletList") && "bg-zinc-200",
        )}
      >
        <ListBulletsIcon className="size-4" weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200",
          editor.isActive("orderedList") && "bg-zinc-200",
        )}
      >
        <ListNumbersIcon className="size-4" weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200",
          editor.isActive("blockquote") && "bg-zinc-200",
        )}
      >
        <QuotesIcon className="size-4" weight="bold" />
      </button>
      <div className="w-px h-8 bg-zinc-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-zinc-200 disabled:opacity-30"
      >
        <ArrowUUpLeftIcon className="size-4" weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-zinc-200 disabled:opacity-30"
      >
        <ArrowUUpRightIcon className="size-4" weight="bold" />
      </button>
      <div className="w-px h-8 bg-zinc-300 mx-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200",
          editor.isActive({ textAlign: "left" }) && "bg-zinc-200",
        )}
      >
        <TextAlignLeftIcon className="size-4" weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200",
          editor.isActive({ textAlign: "center" }) && "bg-zinc-200",
        )}
      >
        <TextAlignCenterIcon className="size-4" weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200",
          editor.isActive({ textAlign: "right" }) && "bg-zinc-200",
        )}
      >
        <TextAlignRightIcon className="size-4" weight="bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={cn(
          "p-2 rounded hover:bg-zinc-200",
          editor.isActive({ textAlign: "justify" }) && "bg-zinc-200",
        )}
      >
        <TextAlignJustifyIcon className="size-4" weight="bold" />
      </button>
    </div>
  );
};

export const EssayEditor = ({
  content,
  onUpdate,
  editable = true,
  className,
}: EssayEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-6",
          className,
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getJSON()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
      {editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
};
