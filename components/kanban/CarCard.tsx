import React from "react";
import { KanbanCard } from "./KanbanBoard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

interface CarCardProps {
  card: KanbanCard;
  onDelete?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({ card, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    cursor: "grab",
    boxShadow: isDragging ? "0 4px 16px 0 rgba(0,0,0,0.10)" : undefined,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-background rounded-lg shadow border border-border/20 hover:bg-accent/40 transition-colors duration-150 p-3 flex flex-col gap-1 group focus-within:ring-2 focus-within:ring-primary/40"
      tabIndex={0}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base font-semibold text-foreground flex-1 truncate">{card.title}</span>
        <span className="z-10"><GripVertical className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100" /></span>
      </div>
      {card.description && (
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {card.description}
        </div>
      )}
      {onDelete && (
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="bg-zinc-800/80 hover:bg-red-600 text-zinc-300 hover:text-white rounded-full p-1 shadow focus:outline-none focus:ring-2 focus:ring-red-400 z-20"
            aria-label="Delete card"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CarCard;
