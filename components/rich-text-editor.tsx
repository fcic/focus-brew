"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
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
  showToolbar?: boolean;
  saveStatus?: "saving" | "saved" | "idle";
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
}

// Custom extension to preserve whitespace
const PreserveWhitespace = Extension.create({
  name: "preserveWhitespace",
  addOptions() {
    return {
      preserveOnPaste: true,
      preserveOnSave: true,
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          class: {
            default: "whitespace-pre-wrap",
          },
        },
      },
    ];
  },
});

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
      class: "text-primary underline",
    },
  }),
  Placeholder.configure({
    placeholder: "Write something...",
    emptyEditorClass: "is-editor-empty",
  }),
  PreserveWhitespace,
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
            isActive && "bg-primary/20 text-primary"
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded-md">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return <span className="w-px h-6 bg-border mx-1" />;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something...",
  autofocus = false,
  className,
  showToolbar = true,
  saveStatus,
  onSave,
  onUndo,
  onRedo,
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
      // Get HTML with preserved whitespace
      const html = editor.getHTML();
      // Preserve any consecutive spaces that might be normalized by the browser
      const preservedHtml = html.replace(/ {2,}/g, (match) =>
        match
          .split("")
          .map(() => "&nbsp;")
          .join("")
      );
      onChange(preservedHtml);
    },
    autofocus,
    editorProps: {
      attributes: {
        class: "outline-none",
      },
      transformPastedHTML(html) {
        // Ensure whitespace is preserved in pasted content
        return html;
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

  // Add keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key.toLowerCase() === "s" && onSave) {
          e.preventDefault();
          onSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, onSave]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {showToolbar && (
        <TooltipProvider>
          <div className="flex items-center flex-wrap gap-1 p-2 border-b border-border">
            {toolbarButtons.map((button, index) =>
              button ? (
                <ToolbarButton key={button.label} {...button} />
              ) : (
                <Divider key={`divider-${index}`} />
              )
            )}
            {saveStatus && (
              <div className="ml-auto text-sm text-muted-foreground">
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                  ? "Saved"
                  : ""}
              </div>
            )}
          </div>
        </TooltipProvider>
      )}

      <EditorContent
        editor={editor}
        className="flex-1 overflow-auto p-6 prose dark:prose-invert prose-sm max-w-none focus:outline-none editor-content"
      />

      <style jsx global>{`
        .editor-content .ProseMirror {
          min-height: 150px;
          line-height: 1.6;
          padding: 0.5rem 0;
          color: var(--foreground);
          white-space: pre-wrap;
        }

        .editor-content .ProseMirror p {
          margin-bottom: 1rem;
          white-space: pre-wrap;
        }

        .editor-content .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.75rem;
          color: var(--foreground);
        }

        .editor-content .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
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
          color: var(--primary);
          text-decoration: underline;
        }

        .editor-content .ProseMirror blockquote {
          border-left: 2px solid var(--border);
          margin-left: 0;
          margin-right: 0;
          padding-left: 1rem;
          color: var(--muted-foreground);
        }

        .editor-content .ProseMirror code {
          background-color: var(--muted);
          color: var(--foreground);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }

        .editor-content .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted-foreground);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
