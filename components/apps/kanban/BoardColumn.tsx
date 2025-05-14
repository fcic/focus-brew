import React, { memo, useState } from "react";
import { KanbanColumn } from "./KanbanBoard";
import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import CarCard from "./CarCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  column: KanbanColumn;
  addCard: (columnId: string, title: string, description?: string) => void;
  deleteCard: (columnId: string, cardId: string) => void;
}

const BoardColumn = memo(
  ({ column, addCard, deleteCard }: BoardColumnProps) => {
    const { setNodeRef } = useDroppable({ id: column.id });
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (newTitle.trim()) {
        addCard(column.id, newTitle.trim(), newDescription.trim() || undefined);
        setNewTitle("");
        setNewDescription("");
        setDialogOpen(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAdd(e);
      }
    };

    return (
      <div
        ref={setNodeRef}
        className={cn(
          "bg-background/80 rounded-2xl p-4 min-w-[300px] flex flex-col gap-3",
          "shadow-lg border border-border/40 backdrop-blur-sm"
        )}
        role="region"
        aria-label={`${column.title} column`}
      >
        <div className="flex items-center justify-between mb-1 pb-2 border-b border-border/40">
          <h2 className="font-semibold text-lg text-foreground tracking-tight truncate">
            {column.title}
            <span className="ml-2 text-sm text-muted-foreground">
              ({column.cards.length})
            </span>
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Add card to ${column.title}`}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Create a new task in the {column.title} column.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdd} className="flex flex-col gap-4 mt-2">
                <div className="space-y-2">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Task title..."
                    autoFocus
                    aria-label="Task title"
                  />
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description (optional)..."
                    aria-label="Task description"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={!newTitle.trim()}>
                    Add Task
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-1 min-h-[120px] max-h-[60vh]">
          <SortableContext
            items={column.cards.map((card) => card.id)}
            strategy={rectSortingStrategy}
          >
            <div className="flex flex-col gap-3 pr-2">
              {column.cards.map((card) => (
                <CarCard
                  key={card.id}
                  card={card}
                  onDelete={() => deleteCard(column.id, card.id)}
                />
              ))}
            </div>
          </SortableContext>
        </ScrollArea>
      </div>
    );
  }
);

BoardColumn.displayName = "BoardColumn";

export default BoardColumn;
