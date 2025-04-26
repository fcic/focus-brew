import React, { useState } from "react";
import { KanbanColumn } from "./KanbanBoard";
import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import CarCard from "./CarCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BoardColumnProps {
  column: KanbanColumn;
  addCard: (columnId: string, title: string, description?: string) => void;
  deleteCard: (columnId: string, cardId: string) => void;
}

const BoardColumn: React.FC<BoardColumnProps> = ({ column, addCard, deleteCard }) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [newTitle, setNewTitle] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      addCard(column.id, newTitle.trim());
      setNewTitle("");
      setDialogOpen(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className="bg-zinc-900/80 rounded-2xl p-4 min-w-[270px] flex flex-col gap-3 shadow-lg border border-zinc-700/40"
    >
      <div className="flex items-center justify-between mb-1 pb-1 border-b border-zinc-700/40">
        <h2 className="font-semibold text-lg text-white tracking-tight truncate">{column.title}</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="text-white bg-zinc-800 hover:bg-zinc-700" aria-label="Add card">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="flex flex-col gap-4 mt-2">
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Card title..."
                className="bg-zinc-800/80 border-zinc-700/40 text-white placeholder:text-zinc-400 h-9 text-sm"
                autoFocus
              />
              <DialogFooter>
                <Button type="submit" disabled={!newTitle.trim()} className="bg-zinc-900 text-white hover:bg-zinc-800">Add</Button>
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
              <CarCard key={card.id} card={card} onDelete={() => deleteCard(column.id, card.id)} />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
};

export default BoardColumn;
