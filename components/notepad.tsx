"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Trash,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Toggle } from "@/components/ui/toggle";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export function Notepad() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", []);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedNote = selectedNoteId
    ? notes.find((note) => note.id === selectedNoteId)
    : null;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: selectedNote?.content || "",
    onUpdate: ({ editor }) => {
      if (selectedNoteId) {
        updateNoteContent(selectedNoteId, editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && selectedNote) {
      editor.commands.setContent(selectedNote.content);
    }
  }, [selectedNoteId, editor, selectedNote]);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(), // Ensure unique ID by using timestamp
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes([...notes, newNote]);
    setSelectedNoteId(newNote.id);
  };

  const updateNoteTitle = (id: string, title: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, title, updatedAt: Date.now() } : note
      )
    );
  };

  const updateNoteContent = (id: string, content: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, content, updatedAt: Date.now() } : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-[200px]"
        />
        <Button onClick={createNewNote} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Note
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-zinc-200 dark:border-zinc-800">
          <ScrollArea className="h-full">
            <AnimatePresence>
              {filteredNotes.length === 0 ? (
                <motion.div
                  key="empty-notes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 text-center text-zinc-500"
                >
                  No notes yet. Create one to get started!
                </motion.div>
              ) : (
                <div className="p-2">
                  {filteredNotes.map((note) => (
                    <motion.div
                      key={`note-item-${note.id}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className={`mb-2 cursor-pointer transition-all hover:shadow-md ${
                          selectedNoteId === note.id
                            ? "border-zinc-400 dark:border-zinc-600"
                            : ""
                        }`}
                        onClick={() => setSelectedNoteId(note.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium truncate">
                                {note.title}
                              </h3>
                              <p className="text-xs text-zinc-500 mt-1">
                                {new Date(note.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                <Input
                  value={selectedNote.title}
                  onChange={(e) =>
                    updateNoteTitle(selectedNote.id, e.target.value)
                  }
                  placeholder="Note title"
                  className="font-medium"
                />

                <div className="flex items-center gap-1 mt-2">
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("bold")}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleBold().run()
                    }
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("italic")}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleItalic().run()
                    }
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("heading", { level: 1 })}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                  >
                    <Heading1 className="h-3.5 w-3.5" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("heading", { level: 2 })}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                  >
                    <Heading2 className="h-3.5 w-3.5" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("bulletList")}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  >
                    <List className="h-3.5 w-3.5" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("orderedList")}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("blockquote")}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </Toggle>
                  <Toggle
                    size="sm"
                    pressed={editor?.isActive("codeBlock")}
                    onPressedChange={() =>
                      editor?.chain().focus().toggleCodeBlock().run()
                    }
                  >
                    <Code className="h-3.5 w-3.5" />
                  </Toggle>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <EditorContent
                  editor={editor}
                  className="prose dark:prose-invert max-w-none editor-content"
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

                  .editor-content .ProseMirror blockquote {
                    border-left: 3px solid #e5e7eb;
                    padding-left: 1rem;
                    margin-left: 0;
                    margin-right: 0;
                    font-style: italic;
                  }

                  .editor-content .ProseMirror code {
                    background-color: rgba(#616161, 0.1);
                    color: #616161;
                  }

                  .editor-content .ProseMirror pre {
                    background: #0d0d0d;
                    color: #fff;
                    font-family: "JetBrainsMono", monospace;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                  }

                  .editor-content .ProseMirror pre code {
                    color: inherit;
                    padding: 0;
                    background: none;
                    font-size: 0.8rem;
                  }

                  .editor-content .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                  }
                `}</style>
              </ScrollArea>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              Select a note or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
