"use client";

import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { Plus, Trash2, CheckCircle2, Circle, X } from "lucide-react";
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
  index: number;
}

const springAnimation = {
  type: "spring",
  stiffness: 500,
  damping: 30,
} as const;

const TodoItem = memo(({ todo, onToggle, onDelete, index }: TodoItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
        transition={{
          ...springAnimation,
          delay: index * 0.05,
        }}
        className="group flex items-center justify-between p-3 bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-300/20 dark:border-zinc-700/20 hover:bg-white/40 dark:hover:bg-zinc-800/40 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            aria-pressed={todo.completed}
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {todo.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary transition-colors" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-400 dark:text-zinc-500 transition-colors" />
              )}
            </motion.div>
          </Button>
          <span
            className={cn(
              "text-sm truncate transition-all duration-200",
              todo.completed && "line-through text-zinc-400 dark:text-zinc-500"
            )}
            title={todo.text}
          >
            {todo.text}
          </span>
        </div>
        <AnimatePresence>
          {(isHovered || todo.completed) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
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
                <motion.div
                  whileHover={{ scale: 1.1, color: "rgb(239, 68, 68)" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="h-4 w-4 text-red-500/70" />
                </motion.div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springAnimation}
      className="flex flex-col items-center justify-center text-zinc-500 dark:text-zinc-400 text-sm py-12 space-y-2"
    >
      <motion.div
        className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <CheckCircle2 className="w-8 h-8 text-zinc-400 dark:text-zinc-600" />
      </motion.div>
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
    // Tempo de espera para garantir que o DOM esteja pronto
    const timeoutId = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
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

  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [todos]);

  return (
    <div className="h-full flex flex-col p-4 bg-white/10 dark:bg-zinc-900/10 backdrop-blur-md">
      <h1 className="text-lg font-semibold mb-4">Tasks</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10 bg-white/30 dark:bg-zinc-800/30 border-zinc-300/30 dark:border-zinc-700/30 focus-visible:ring-primary/20"
              aria-label="New task"
              disabled={isSubmitting}
            />
            {newTodo.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setNewTodo("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
                aria-label="Clear input"
              >
                <X className="h-3 w-3 text-zinc-400" />
              </Button>
            )}
          </div>
          <Button
            type="submit"
            disabled={!newTodo.trim() || isSubmitting}
            className="bg-primary/90 hover:bg-primary transition-colors"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </motion.div>
          </Button>
        </div>
      </form>

      <div className="flex-1 overflow-auto">
        {todos.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.ul className="space-y-2" layout>
            <AnimatePresence initial={false}>
              {sortedTodos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      {todos.length > 0 && (
        <div className="mt-4 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            {todos.length} task{todos.length !== 1 ? "s" : ""}
          </span>
          <span>{todos.filter((t) => t.completed).length} completed</span>
        </div>
      )}
    </div>
  );
};
