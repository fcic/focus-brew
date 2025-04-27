"use client";

import { useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  LinkIcon,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Code,
  Quote,
  Eraser,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Types
interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autofocus?: boolean;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

// Constants
const EDITOR_EXTENSIONS = [
  StarterKit.configure({
    heading: {
      levels: [1, 2],
    },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: "noopener noreferrer",
      class: "text-blue-500 underline",
    },
  }),
  Placeholder.configure({
    placeholder: "Write something...",
    emptyEditorClass: "is-editor-empty",
  }),
] as const;

// Components
function ToolbarButton({
  onClick,
  isActive,
  icon,
  label,
  shortcut,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={cn(
            "h-8 w-8 rounded-md",
            isActive && "bg-zinc-800 text-zinc-200"
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 text-xs bg-zinc-800 rounded-md">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-zinc-800 mx-1" />;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something...",
  autofocus = false,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      ...EDITOR_EXTENSIONS,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    autofocus,
    editorProps: {
      attributes: {
        class: "outline-none",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    } catch {
      alert("Please enter a valid URL");
    }
  }, [editor]);

  const clearFormat = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  const toolbarButtons = useMemo(
    () => [
      {
        icon: <Bold className="h-4 w-4" />,
        label: "Bold",
        shortcut: "⌘+B",
        onClick: () => editor?.chain().focus().toggleBold().run(),
        isActive: editor?.isActive("bold"),
      },
      {
        icon: <Italic className="h-4 w-4" />,
        label: "Italic",
        shortcut: "⌘+I",
        onClick: () => editor?.chain().focus().toggleItalic().run(),
        isActive: editor?.isActive("italic"),
      },
      {
        icon: <UnderlineIcon className="h-4 w-4" />,
        label: "Underline",
        shortcut: "⌘+U",
        onClick: () => editor?.chain().focus().toggleUnderline().run(),
        isActive: editor?.isActive("underline"),
      },
      {
        icon: <Code className="h-4 w-4" />,
        label: "Code",
        shortcut: "⌘+E",
        onClick: () => editor?.chain().focus().toggleCode().run(),
        isActive: editor?.isActive("code"),
      },
      null, // Divider
      {
        icon: <Heading1 className="h-4 w-4" />,
        label: "Heading 1",
        shortcut: "⌘+⇧+1",
        onClick: () =>
          editor?.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor?.isActive("heading", { level: 1 }),
      },
      {
        icon: <Heading2 className="h-4 w-4" />,
        label: "Heading 2",
        shortcut: "⌘+⇧+2",
        onClick: () =>
          editor?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor?.isActive("heading", { level: 2 }),
      },
      null, // Divider
      {
        icon: <List className="h-4 w-4" />,
        label: "Bullet List",
        shortcut: "⌘+⇧+8",
        onClick: () => editor?.chain().focus().toggleBulletList().run(),
        isActive: editor?.isActive("bulletList"),
      },
      {
        icon: <ListOrdered className="h-4 w-4" />,
        label: "Numbered List",
        shortcut: "⌘+⇧+7",
        onClick: () => editor?.chain().focus().toggleOrderedList().run(),
        isActive: editor?.isActive("orderedList"),
      },
      {
        icon: <Quote className="h-4 w-4" />,
        label: "Blockquote",
        shortcut: "⌘+⇧+B",
        onClick: () => editor?.chain().focus().toggleBlockquote().run(),
        isActive: editor?.isActive("blockquote"),
      },
      null, // Divider
      {
        icon: <LinkIcon className="h-4 w-4" />,
        label: "Link",
        shortcut: "⌘+K",
        onClick: setLink,
        isActive: editor?.isActive("link"),
      },
      null, // Divider
      {
        icon: <Undo className="h-4 w-4" />,
        label: "Undo",
        shortcut: "⌘+Z",
        onClick: () => editor?.chain().focus().undo().run(),
      },
      {
        icon: <Redo className="h-4 w-4" />,
        label: "Redo",
        shortcut: "⌘+⇧+Z",
        onClick: () => editor?.chain().focus().redo().run(),
      },
      {
        icon: <Eraser className="h-4 w-4" />,
        label: "Clear Formatting",
        onClick: clearFormat,
      },
    ],
    [editor, setLink, clearFormat]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("flex flex-col h-full bg-zinc-950", className)}>
      <TooltipProvider>
        <div className="flex items-center flex-wrap gap-1 p-2 border-b border-zinc-800/50">
          {toolbarButtons.map((button, index) =>
            button ? (
              <ToolbarButton key={button.label} {...button} />
            ) : (
              <Divider key={`divider-${index}`} />
            )
          )}
        </div>
      </TooltipProvider>

      <EditorContent
        editor={editor}
        className="flex-1 overflow-auto p-6 prose prose-sm max-w-none focus:outline-none editor-content"
      />

      <style jsx global>{`
        .editor-content .ProseMirror {
          min-height: 150px;
          line-height: 1.6;
          padding: 0.5rem 0;
          color: rgb(244 244 245);
        }

        .editor-content .ProseMirror p {
          margin-bottom: 1rem;
        }

        .editor-content .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.75rem;
          color: rgb(244 244 245);
        }

        .editor-content .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          color: rgb(244 244 245);
        }

        .editor-content .ProseMirror ul,
        .editor-content .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .editor-content .ProseMirror li {
          margin-bottom: 0.25rem;
        }

        .editor-content .ProseMirror a {
          color: rgb(59 130 246);
          text-decoration: underline;
        }

        .editor-content .ProseMirror blockquote {
          border-left: 2px solid rgb(82 82 91);
          margin-left: 0;
          margin-right: 0;
          padding-left: 1rem;
          color: rgb(161 161 170);
        }

        .editor-content .ProseMirror code {
          background-color: rgb(39 39 42);
          color: rgb(244 244 245);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }

        .editor-content .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgb(113 113 122);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
