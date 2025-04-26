"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { motion, AnimatePresence } from "framer-motion";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoAppProps {}

export function TodoApp({}: TodoAppProps) {
  const [todos, setTodos] = useLocalStorage<Todo[]>("todos", []);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now().toString(),
          text: newTodo,
          completed: false,
        },
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <form
          className="flex space-x-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTodo();
          }}
        >
          <Input
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 bg-white/50 dark:bg-zinc-800/50 border-zinc-300/30 dark:border-zinc-700/30"
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" size="icon" className="rounded-lg">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add</span>
            </Button>
          </motion.div>
        </form>
      </div>

      <div className="flex-1 overflow-auto">
        {todos.length === 0 ? (
          <AnimatePresence>
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-8"
            >
              No tasks yet. Add one above!
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence>
            <ul className="space-y-3">
              {todos.map((todo) => (
                <motion.li
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="flex items-center justify-between p-3 bg-white/30 dark:bg-zinc-800/30 backdrop-blur-sm rounded-lg border border-zinc-300/20 dark:border-zinc-700/20"
                >
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full p-0"
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                      )}
                    </Button>
                    <span
                      className={`text-sm ${
                        todo.completed
                          ? "line-through text-zinc-400 dark:text-zinc-500"
                          : ""
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="rounded-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
