"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const springAnimation = {
  type: "spring",
  stiffness: 500,
  damping: 30,
} as const;

const TodoItem = memo(({ todo, onToggle, onDelete }: TodoItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(todo.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <motion.li
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={springAnimation}
        className="group flex items-center justify-between p-3 bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-300/20 dark:border-zinc-700/20 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-offset-2"
            onClick={() => onToggle(todo.id)}
            onKeyDown={(e) => handleKeyDown(e, () => onToggle(todo.id))}
            aria-label={
              todo.completed ? "Mark as incomplete" : "Mark as complete"
            }
          >
            {todo.completed ? (
              <CheckCircle2 className="h-5 w-5 text-primary transition-colors" />
            ) : (
              <Circle className="h-5 w-5 text-zinc-400 dark:text-zinc-500 transition-colors" />
            )}
          </Button>
          <span
            className={cn(
              "text-sm truncate",
              todo.completed && "line-through text-zinc-400 dark:text-zinc-500"
            )}
            title={todo.text}
          >
            {todo.text}
          </span>
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            onKeyDown={(e) =>
              handleKeyDown(e, () => setIsDeleteDialogOpen(true))
            }
            className="rounded-full focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="Delete todo"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </motion.div>
      </motion.li>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

TodoItem.displayName = "TodoItem";

const EmptyState = memo(() => {
  return (
    <motion.div
      key="empty-state"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm py-12 space-y-2"
    >
      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
      </div>
      <p className="font-medium">No tasks yet</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Add your first task above to get started
      </p>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

export const TodoApp = () => {
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", []);
  const [newTodo, setNewTodo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleAddTodo = useCallback(async () => {
    if (newTodo.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        setTodos((currentTodos) => [
          ...currentTodos,
          {
            id: crypto.randomUUID(),
            text: newTodo.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
          },
        ]);
        setNewTodo("");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [newTodo, setTodos, isSubmitting]);

  const handleToggleTodo = useCallback(
    (id: string) => {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
    },
    [setTodos]
  );

  const handleDeleteTodo = useCallback(
    (id: string) => {
      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    },
    [setTodos]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddTodo();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTodo();
    }
  };

  const sortedTodos = todos.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div>
        <form
          className="flex space-x-2"
          onSubmit={handleSubmit}
          role="form"
          aria-label="Add todo form"
        >
          <Input
            ref={inputRef}
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white/50 dark:bg-zinc-800/50 border-zinc-300/30 dark:border-zinc-700/30 focus-visible:ring-2 focus-visible:ring-offset-2"
            disabled={isSubmitting}
            aria-label="New todo input"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              size="icon"
              className="rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2"
              disabled={isSubmitting || !newTodo.trim()}
              aria-label="Add todo"
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add</span>
            </Button>
          </motion.div>
        </form>
      </div>

      <div className="flex-1 overflow-auto -mx-6 px-6">
        <AnimatePresence mode="popLayout">
          {todos.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="space-y-3" role="list" aria-label="Todo list">
              {sortedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
