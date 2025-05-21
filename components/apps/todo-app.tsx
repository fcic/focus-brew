"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  Circle,
  X,
  Clock,
  MoreHorizontal,
  ArrowUpDown,
  CheckCheck,
  ListTodo,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  onUpdate: (id: string, newText: string) => void;
  index: number;
}

type SortOption = "newest" | "oldest" | "alphabetical";
type FilterOption = "all" | "active" | "completed";

const springAnimation = {
  type: "spring",
  stiffness: 500,
  damping: 30,
} as const;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
};

const TodoItem = memo(
  ({ todo, onToggle, onDelete, index, onUpdate }: TodoItemProps) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditTask, setIsEditTask] = useState(false);
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditTask && editInputRef.current) {
        editInputRef.current.focus();
      }
    }, [isEditTask]);

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        action();
      }
    };

    const handleEditInputKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setIsEditTask(false);
      }
    };

    const handleEditClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsEditTask(!isEditTask);
    };
    const handleEditTask = (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate(todo.id, e.target.value);
    };
    const saveEditedTask = () => {
      setIsEditTask(!isEditTask);
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{
            ...springAnimation,
            delay: index * 0.05,
          }}
          className={cn(
            "group flex items-start p-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0",
            todo.completed && "bg-zinc-50 dark:bg-zinc-900/30"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full p-0 mt-0.5 flex-shrink-0"
            onClick={() => onToggle(todo.id)}
            onKeyDown={(e) => handleKeyDown(e, () => onToggle(todo.id))}
            aria-label={
              todo.completed ? "Mark as incomplete" : "Mark as complete"
            }
            aria-pressed={todo.completed}
          >
            {todo.completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 transition-colors" />
            ) : (
              <Circle className="h-5 w-5 text-zinc-300 dark:text-zinc-600 transition-colors" />
            )}
          </Button>

          <div className="flex-1 min-w-0 ml-3">
            <div className="flex items-center justify-between">
              {isEditTask ? (
                <Input
                  ref={editInputRef}
                  type="text"
                  placeholder="What needs to be done?"
                  value={todo.text}
                  onChange={handleEditTask}
                  onKeyDown={handleEditInputKeyDown}
                  className="pr-20 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  aria-label="Edit task"
                />
              ) : (
                <span
                  className={cn(
                    "text-sm font-medium break-words transition-all duration-200",
                    todo.completed &&
                      "line-through text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {todo.text}
                </span>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditClick}
                  className="h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  aria-label="Edit todo"
                >
                  <Pencil className="h-4 w-4 text-zinc-400 hover:text-blue-500 transition-colors" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  aria-label="Delete todo"
                >
                  <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500 transition-colors" />
                </Button>
              </div>
            </div>

            <div className="flex items-center mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              {isEditTask ? (
                <Button
                  type="submit"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsEditTask(!isEditTask)}
                >
                  Save
                </Button>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatDate(todo.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

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
  }
);

TodoItem.displayName = "TodoItem";

const EmptyState = memo(({ filter }: { filter: FilterOption }) => {
  const messages = {
    all: {
      title: "No tasks yet",
      description: "Add your first task to get started",
      icon: <ListTodo className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />,
    },
    active: {
      title: "No active tasks",
      description: "All your tasks are completed",
      icon: (
        <CheckCheck className="w-8 h-8 text-emerald-300 dark:text-emerald-700" />
      ),
    },
    completed: {
      title: "No completed tasks",
      description: "Complete a task to see it here",
      icon: (
        <CheckCircle2 className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
      ),
    },
  };

  return (
    <motion.div
      key={`empty-${filter}`}
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
        {messages[filter].icon}
      </motion.div>
      <p className="font-medium">{messages[filter].title}</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        {messages[filter].description}
      </p>
    </motion.div>
  );
});

EmptyState.displayName = "EmptyState";

export const TodoApp = () => {
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", []);
  const [newTodo, setNewTodo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Wait to ensure DOM is ready
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

  const handleUpdate = (id: string, newText: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
    );
  };

  const handleClearCompleted = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  };

  const filteredTodos = useMemo(() => {
    let filtered = [...todos];

    // Apply filter
    if (filterOption === "active") {
      filtered = filtered.filter((todo) => !todo.completed);
    } else if (filterOption === "completed") {
      filtered = filtered.filter((todo) => todo.completed);
    }

    // Apply sort
    return filtered.sort((a, b) => {
      if (sortOption === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortOption === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else {
        return a.text.localeCompare(b.text);
      }
    });
  }, [todos, sortOption, filterOption]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    const percentComplete =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, active, percentComplete };
  }, [todos]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-100 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Tasks</h1>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="sr-only">Sort tasks</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setSortOption("newest")}
                        className={cn(
                          sortOption === "newest" &&
                            "bg-zinc-100 dark:bg-zinc-800"
                        )}
                      >
                        Newest first
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortOption("oldest")}
                        className={cn(
                          sortOption === "oldest" &&
                            "bg-zinc-100 dark:bg-zinc-800"
                        )}
                      >
                        Oldest first
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSortOption("alphabetical")}
                        className={cn(
                          sortOption === "alphabetical" &&
                            "bg-zinc-100 dark:bg-zinc-800"
                        )}
                      >
                        Alphabetical
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>Sort tasks</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {todos.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={handleClearCompleted}
                          disabled={stats.completed === 0}
                        >
                          Clear completed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-20 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            aria-label="New task"
            disabled={isSubmitting}
          />
          {newTodo.trim() && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setNewTodo("")}
              className="absolute right-12 top-1/2 -translate-y-1/2 h-6 w-6"
              aria-label="Clear input"
              tabIndex={-1}
              aria-hidden="true"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="submit"
            disabled={!newTodo.trim() || isSubmitting}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </form>
      </header>

      {todos.length > 0 && (
        <div className="border-b border-zinc-100 dark:border-zinc-800 px-2 py-2">
          <div className="flex items-center justify-between">
            <Tabs
              value={filterOption}
              onValueChange={(value) => setFilterOption(value as FilterOption)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs">
                  Active ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">
                  Completed ({stats.completed})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {filteredTodos.length === 0 ? (
          <EmptyState filter={filterOption} />
        ) : (
          <motion.div
            layout
            className="divide-y divide-zinc-100 dark:divide-zinc-800"
          >
            <AnimatePresence initial={false}>
              {filteredTodos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={handleUpdate}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {todos.length > 0 && (
        <footer className="border-t border-zinc-100 dark:border-zinc-800 p-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-sm font-normal">
                {stats.total} total
              </Badge>
              <Badge variant="outline" className="rounded-sm font-normal">
                {stats.completed} completed
              </Badge>
            </div>

            <div>
              {stats.percentComplete > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${stats.percentComplete}%` }}
                    />
                  </div>
                  <span>{stats.percentComplete}%</span>
                </div>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
