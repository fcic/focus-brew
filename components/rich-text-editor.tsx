"use client";

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
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write something...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleBulletList = () =>
    editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () =>
    editor.chain().focus().toggleOrderedList().run();
  const toggleH1 = () =>
    editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () =>
    editor.chain().focus().toggleHeading({ level: 2 }).run();

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center space-x-1 p-2 border-b border-border/20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleBold}
          className={`h-8 w-8 rounded-md ${
            editor.isActive("bold") ? "bg-muted" : ""
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleItalic}
          className={`h-8 w-8 rounded-md ${
            editor.isActive("italic") ? "bg-muted" : ""
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleUnderline}
          className={`h-8 w-8 rounded-md ${
            editor.isActive("underline") ? "bg-muted" : ""
          }`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <span className="w-px h-6 bg-border/50 mx-1"></span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleH1}
          className={`h-8 w-8 rounded-md ${
            editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleH2}
          className={`h-8 w-8 rounded-md ${
            editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <span className="w-px h-6 bg-border/50 mx-1"></span>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleBulletList}
          className={`h-8 w-8 rounded-md ${
            editor.isActive("bulletList") ? "bg-muted" : ""
          }`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleOrderedList}
          className={`h-8 w-8 rounded-md ${
            editor.isActive("orderedList") ? "bg-muted" : ""
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={setLink}
          className={`h-8 w-8 rounded-md ${
            editor.isActive("link") ? "bg-muted" : ""
          }`}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent
        editor={editor}
        className="flex-1 overflow-auto p-6 prose prose-sm max-w-none focus:outline-none editor-content"
      />
      <style jsx global>{`
        .editor-content .ProseMirror {
          min-height: 150px;
          line-height: 1.6;
          padding: 0.5rem 0;
        }

        .editor-content .ProseMirror p {
          margin-bottom: 1rem;
        }

        .editor-content .ProseMirror h1 {
          font-size: 1.5rem;
          margin-top: 1rem;
          margin-bottom: 0.75rem;
        }

        .editor-content .ProseMirror h2 {
          font-size: 1.25rem;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
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
          color: #3b82f6;
          text-decoration: underline;
        }

        .editor-content .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
