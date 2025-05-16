"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash, Search, Save } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { cn, formatShortcut } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const AUTOSAVE_DELAY = 1000; // 1 second

export function Notepad() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notepad-notes", []);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "idle">(
    "idle"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const selectedNote = selectedNoteId
    ? notes.find((note) => note.id === selectedNoteId)
    : null;

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes([...notes, newNote]);
    setSelectedNoteId(newNote.id);
    setSaveStatus("idle");

    // Add a slight delay to ensure the DOM has updated before focusing
    setTimeout(() => {
      const titleInput = document.querySelector(
        'input[placeholder="Note title"]'
      ) as HTMLInputElement;
      if (titleInput) titleInput.focus();
    }, 100);
  }, [notes, setNotes]);

  const updateNoteTitle = useCallback(
    (id: string, title: string) => {
      setSaveStatus("saving");
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, title, updatedAt: Date.now() } : note
        )
      );
      setTimeout(() => setSaveStatus("saved"), AUTOSAVE_DELAY);
    },
    [setNotes]
  );

  const updateNoteContent = useCallback(
    (id: string, content: string) => {
      setSaveStatus("saving");
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id ? { ...note, content, updatedAt: Date.now() } : note
        )
      );
      setTimeout(() => setSaveStatus("saved"), AUTOSAVE_DELAY);
    },
    [setNotes]
  );

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "l":
            e.preventDefault();
            setIsSearching(true);
            break;
          case "s":
            e.preventDefault();
            if (selectedNoteId) {
              setSaveStatus("saved");
              toast({
                title: "Note saved",
                description: "Your note has been saved successfully.",
              });
            }
            break;
          case "b":
            e.preventDefault();
            createNewNote();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNoteId, createNewNote, updateNoteContent]);

  const deleteNote = (id: string) => {
    setNoteToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      if (selectedNoteId === noteToDelete) {
        setSelectedNoteId(null);
      }
      setNotes(notes.filter((note) => note.id !== noteToDelete));
      setNoteToDelete(null);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
    }
  };

  const handleEditorChange = (content: string) => {
    if (selectedNoteId) {
      updateNoteContent(selectedNoteId, content);
    }
  };

  return (
    <div className="flex h-full border-border bg-background">
      <div className="w-72 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border flex flex-col gap-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search notes... (${formatShortcut("L")})`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
              onFocus={() => setIsSearching(true)}
              onBlur={() => {
                if (!searchQuery) {
                  setIsSearching(false);
                }
              }}
            />
          </div>
          <Button onClick={createNewNote} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            New ({formatShortcut("B")})
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <AnimatePresence>
            {filteredNotes.length === 0 ? (
              <motion.div
                key="empty-notes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 text-center text-zinc-500"
              >
                {searchQuery
                  ? "No matching notes found"
                  : "No notes yet. Create one to get started!"}
              </motion.div>
            ) : (
              <div className="p-3 space-y-2">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={`note-item-${note.id}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      onClick={() => setSelectedNoteId(note.id)}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedNoteId === note.id
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-background hover:border-border/80"
                      )}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate mb-1">
                              {note.title || "Untitled Note"}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {new Date(note.updatedAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(note.updatedAt).toLocaleTimeString(
                                  undefined,
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
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

      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <Input
                value={selectedNote.title}
                onChange={(e) =>
                  updateNoteTitle(selectedNote.id, e.target.value)
                }
                placeholder="Note title"
                className="font-medium mb-3"
                onFocus={() => setIsTitleFocused(true)}
                onBlur={() => setIsTitleFocused(false)}
              />
            </div>

            <ScrollArea className="flex-1">
              <div ref={editorRef} className="h-full">
                <RichTextEditor
                  content={selectedNote.content}
                  onChange={handleEditorChange}
                  placeholder="Start typing..."
                  autofocus={
                    !isTitleFocused &&
                    selectedNote.title !== "" &&
                    selectedNote.content !== ""
                  }
                  className="bg-background border-none editor-content"
                  saveStatus={saveStatus}
                  onSave={() => {
                    setSaveStatus("saved");
                    toast({
                      title: "Note saved",
                      description: "Your note has been saved successfully.",
                    });
                  }}
                />
              </div>
              <style jsx global>{`
                /* Specific styles for the editor inside notepad */
                .editor-content {
                  height: 100%;
                }

                .editor-content .ProseMirror {
                  min-height: 150px;
                }
              `}</style>
            </ScrollArea>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
            <div className="text-center">
              <p className="mb-2">Select a note or create a new one</p>
              <p className="text-sm">
                Press{" "}
                <kbd className="px-2 py-1 bg-muted rounded">
                  {formatShortcut("B")}
                </kbd>{" "}
                to create a new note
              </p>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
