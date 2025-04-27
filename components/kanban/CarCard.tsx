import React, { memo } from "react";
import { KanbanCard } from "./KanbanBoard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CarCardProps {
  card: KanbanCard;
  onDelete?: () => void;
}

const CarCard = memo(({ card, onDelete }: CarCardProps) => {
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
      className={cn(
        "bg-background rounded-lg border transition-colors duration-150 p-3 flex flex-col gap-1 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDragging
          ? "border-accent shadow-lg"
          : "border-border hover:border-border/80"
      )}
      tabIndex={0}
      role="article"
      aria-label={`Task: ${card.title}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-base font-medium text-foreground flex-1 truncate"
          title={card.title}
        >
          {card.title}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
          {...listeners}
          aria-label="Drag handle"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      {card.description && (
        <div
          className="text-sm text-muted-foreground mt-1 line-clamp-2"
          title={card.description}
        >
          {card.description}
        </div>
      )}
      {onDelete && (
        <div className="flex justify-end mt-2">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete task"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
});

CarCard.displayName = "CarCard";

export default CarCard;
