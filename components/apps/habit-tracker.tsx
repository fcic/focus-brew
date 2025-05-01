"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { format, startOfToday, subDays, isSameDay, isToday } from "date-fns";
import {
  Check,
  Plus,
  Edit,
  Trash2,
  Calendar,
  BarChart3,
  Flame,
  ChevronLeft,
  ChevronRight,
  Bell,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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

// Types
type FrequencyType = "daily" | "weekly" | "custom";
type HabitCategory =
  | "health"
  | "fitness"
  | "productivity"
  | "learning"
  | "mindfulness"
  | "other";

interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency: FrequencyType;
  category: HabitCategory;
  createdAt: string;
  completedDates: string[];
  reminderTime?: string;
  reminderEnabled?: boolean;
  customDays?: string[]; // For custom frequency (e.g., "mon", "wed", "fri")
  duration: number; // Number of times to complete
  period: "days" | "weeks" | "months"; // Period for the duration
}

// Icons for habits
const HABIT_ICONS = [
  "💧",
  "🏃",
  "📚",
  "🧘",
  "💪",
  "🥗",
  "💊",
  "😴",
  "🧠",
  "🎯",
  "💻",
  "🎨",
  "🎵",
  "🌱",
  "✍️",
  "🧹",
];

// Colors for habits
const HABIT_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#14b8a6", // teal
];

// Categories
const CATEGORIES: Record<HabitCategory, { label: string; icon: string }> = {
  health: { label: "Health", icon: "💊" },
  fitness: { label: "Fitness", icon: "💪" },
  productivity: { label: "Productivity", icon: "💻" },
  learning: { label: "Learning", icon: "📚" },
  mindfulness: { label: "Mindfulness", icon: "🧘" },
  other: { label: "Other", icon: "🎯" },
};

// Days of the week for custom frequency
const DAYS_OF_WEEK = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

// Local storage key
const STORAGE_KEY = "habit_tracker_data";

// Helper functions
const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates.length) return 0;

  // Sort dates in descending order
  const sortedDates = [...completedDates]
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = startOfToday();
  const yesterday = subDays(today, 1);

  // Check if the most recent date is today or yesterday
  const mostRecentDate = sortedDates[0];
  if (
    !isSameDay(mostRecentDate, today) &&
    !isSameDay(mostRecentDate, yesterday)
  ) {
    return 0; // Streak broken if not completed today or yesterday
  }

  let streak = 1; // Start with 1 for the most recent day
  let currentDate = mostRecentDate;

  // Check consecutive days backwards
  for (let i = 1; i < sortedDates.length; i++) {
    const expectedPrevDate = subDays(currentDate, 1);
    if (isSameDay(sortedDates[i], expectedPrevDate)) {
      streak++;
      currentDate = sortedDates[i];
    } else {
      break; // Streak broken
    }
  }

  return streak;
};

const calculateCompletionRate = (habit: Habit): number => {
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, i));

  // Count completed days in the last 30 days
  const completedInLast30Days = last30Days.filter((date) =>
    habit.completedDates.some((completedDate) =>
      isSameDay(new Date(completedDate), date)
    )
  ).length;

  return Math.round((completedInLast30Days / 30) * 100);
};

const shouldCompleteToday = (habit: Habit): boolean => {
  const today = new Date();
  const dayOfWeek = today
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase();

  // First check if it's a valid day based on frequency
  let isValidDay = false;
  if (habit.frequency === "daily") {
    isValidDay = true;
  } else if (habit.frequency === "weekly") {
    // For weekly habits, check if it's been completed this week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

    isValidDay = !habit.completedDates.some((date) => {
      const completedDate = new Date(date);
      return completedDate >= startOfWeek && completedDate <= today;
    });
  } else if (habit.frequency === "custom" && habit.customDays) {
    isValidDay = habit.customDays.includes(dayOfWeek.substring(0, 3));
  }

  if (!isValidDay) return false;

  // Then check if we've met the duration requirement for the period
  const periodStart = new Date(today);
  switch (habit.period) {
    case "days":
      periodStart.setDate(today.getDate() - habit.duration + 1);
      break;
    case "weeks":
      periodStart.setDate(today.getDate() - habit.duration * 7 + 1);
      break;
    case "months":
      periodStart.setMonth(today.getMonth() - habit.duration + 1);
      break;
  }

  const completionsInPeriod = habit.completedDates.filter((date) => {
    const completedDate = new Date(date);
    return completedDate >= periodStart && completedDate <= today;
  }).length;

  return completionsInPeriod < habit.duration;
};

// Components
const HabitForm = ({
  onSave,
  onCancel,
  initialHabit,
}: {
  onSave: (habit: Omit<Habit, "id" | "createdAt" | "completedDates">) => void;
  onCancel: () => void;
  initialHabit?: Habit;
}) => {
  const [name, setName] = useState(initialHabit?.name || "");
  const [description, setDescription] = useState(
    initialHabit?.description || ""
  );
  const [icon, setIcon] = useState(initialHabit?.icon || HABIT_ICONS[0]);
  const [color, setColor] = useState(initialHabit?.color || HABIT_COLORS[0]);
  const [frequency, setFrequency] = useState<FrequencyType>(
    initialHabit?.frequency || "daily"
  );
  const [category, setCategory] = useState<HabitCategory>(
    initialHabit?.category || "other"
  );
  const [customDays, setCustomDays] = useState<string[]>(
    initialHabit?.customDays || []
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    initialHabit?.reminderEnabled || false
  );
  const [reminderTime, setReminderTime] = useState(
    initialHabit?.reminderTime || "09:00"
  );
  const [duration, setDuration] = useState(initialHabit?.duration || 1);
  const [period, setPeriod] = useState<"days" | "weeks" | "months">(
    initialHabit?.period || "days"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newHabit = {
      name,
      description,
      icon,
      color,
      frequency,
      category,
      customDays: frequency === "custom" ? customDays : undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      duration,
      period,
    };

    onSave(newHabit);
  };

  const toggleCustomDay = (day: string) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter((d) => d !== day));
    } else {
      setCustomDays([...customDays, day]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Habit name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this habit about?"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-8 gap-2">
          {HABIT_ICONS.map((habitIcon) => (
            <button
              key={habitIcon}
              type="button"
              className={cn(
                "h-10 w-10 rounded-md flex items-center justify-center text-lg",
                icon === habitIcon ? "ring-2 ring-primary" : "hover:bg-muted"
              )}
              onClick={() => setIcon(habitIcon)}
            >
              {habitIcon}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="grid grid-cols-8 gap-2">
          {HABIT_COLORS.map((habitColor) => (
            <button
              key={habitColor}
              type="button"
              className={cn(
                "h-8 w-8 rounded-full",
                color === habitColor ? "ring-2 ring-primary ring-offset-2" : ""
              )}
              style={{ backgroundColor: habitColor }}
              onClick={() => setColor(habitColor)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(value: HabitCategory) => setCategory(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center">
                  <span className="mr-2">{icon}</span>
                  <span>{label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select
          value={frequency}
          onValueChange={(value: FrequencyType) => setFrequency(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="custom">Custom days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {frequency === "custom" && (
        <div className="space-y-2">
          <Label>Days of the week</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  customDays.includes(day.value)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                )}
                onClick={() => toggleCustomDay(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
          {customDays.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Please select at least one day
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <Select
            value={period}
            onValueChange={(value: "days" | "weeks" | "months") =>
              setPeriod(value)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground">
          How many times should this habit be completed in the given period?
        </p>
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder">Reminder</Label>
          <Switch
            id="reminder"
            checked={reminderEnabled}
            onCheckedChange={setReminderEnabled}
          />
        </div>

        {reminderEnabled && (
          <div className="pt-2">
            <Label htmlFor="reminderTime">Time</Label>
            <Input
              id="reminderTime"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-1"
            />
          </div>
        )}
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={frequency === "custom" && customDays.length === 0}
        >
          {initialHabit ? "Update" : "Create"} Habit
        </Button>
      </DialogFooter>
    </form>
  );
};

const HabitItem = ({
  habit,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  onToggle: (id: string, e?: React.MouseEvent) => void;
  onEdit: (habit: Habit, e?: React.MouseEvent) => void;
  onDelete: (id: string, e?: React.MouseEvent) => void;
}) => {
  const isCompletedToday = habit.completedDates.some((date) =>
    isSameDay(new Date(date), new Date())
  );

  const streak = calculateStreak(habit.completedDates);
  const shouldComplete = shouldCompleteToday(habit);

  return (
    <div
      className={cn(
        "group flex items-center p-4 rounded-lg border transition-colors",
        isCompletedToday ? "bg-muted/30" : "bg-card hover:border-primary/50"
      )}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => onToggle(habit.id, e)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 transition-colors",
                isCompletedToday
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-primary/20 group-hover:border-primary/50"
              )}
            >
              {isCompletedToday ? (
                <Check className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-primary/50 group-hover:border-primary" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {isCompletedToday ? "Mark as incomplete" : "Mark as complete"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(habit, e);
        }}
      >
        <div className="flex items-center">
          <span
            className="w-6 h-6 flex items-center justify-center rounded-full mr-2 text-sm"
            style={{ backgroundColor: habit.color, color: "#fff" }}
          >
            {habit.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{habit.name}</h3>
            {habit.description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          {streak > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>{streak} day streak</span>
            </Badge>
          )}
          {habit.frequency !== "daily" && (
            <Badge variant="secondary" className="text-xs">
              {habit.frequency === "weekly" ? "Weekly" : "Custom days"}
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {habit.duration}x/{habit.period.slice(0, -1)}
          </Badge>
          {habit.reminderEnabled && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {habit.reminderTime}
            </Badge>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => onEdit(habit, e)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => onDelete(habit.id, e)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const HabitCalendar = ({ habit }: { habit: Habit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysToShow = 7;

  const navigateDays = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - daysToShow);
    } else {
      newDate.setDate(newDate.getDate() + daysToShow);
    }
    setCurrentDate(newDate);
  };

  // Generate dates to display
  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - currentDate.getDay() + i);
    return date;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Calendar View</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateDays("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateDays("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dates.map((date) => {
          const isCompleted = habit.completedDates.some((completedDate) =>
            isSameDay(new Date(completedDate), date)
          );

          return (
            <TooltipProvider key={date.toISOString()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(date, "EEE")}
                    </div>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs",
                        isToday(date) &&
                          !isCompleted &&
                          "border border-primary",
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {format(date, "d")}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{format(date, "PPP")}</p>
                  <p className="text-xs">
                    {isCompleted ? "Completed" : "Not completed"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

const HabitStats = ({ habit }: { habit: Habit }) => {
  const streak = calculateStreak(habit.completedDates);
  const completionRate = calculateCompletionRate(habit);

  // Calculate best streak
  const calculateBestStreak = () => {
    if (!habit.completedDates.length) return 0;

    const sortedDates = [...habit.completedDates]
      .map((date) => new Date(date))
      .sort((a, b) => a.getTime() - b.getTime());

    let currentStreak = 1;
    let bestStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      const expectedDate = new Date(prevDate);
      expectedDate.setDate(prevDate.getDate() + 1);

      if (isSameDay(currDate, expectedDate)) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return bestStreak;
  };

  const bestStreak = calculateBestStreak();

  // Calculate total completions
  const totalCompletions = habit.completedDates.length;

  // Calculate days since creation
  const daysSinceCreation = Math.max(
    1,
    Math.floor(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Statistics</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">Current Streak</div>
          <div className="text-2xl font-bold flex items-center mt-1">
            <Flame className="h-5 w-5 text-orange-500 mr-1" />
            {streak}
          </div>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">Best Streak</div>
          <div className="text-2xl font-bold mt-1">{bestStreak}</div>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">Completion Rate</div>
          <div className="text-2xl font-bold mt-1">{completionRate}%</div>
          <Progress value={completionRate} className="h-1 mt-2" />
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-sm text-muted-foreground">Total Completions</div>
          <div className="text-2xl font-bold mt-1">{totalCompletions}</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Tracking since {format(new Date(habit.createdAt), "PP")} (
        {daysSinceCreation} days)
      </div>
    </div>
  );
};

const HabitDetail = ({
  habit,
  onClose,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: habit.color, color: "#fff" }}
          >
            <span className="text-lg">{habit.icon}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{habit.name}</h2>
            {habit.description && (
              <p className="text-sm text-muted-foreground">
                {habit.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(habit)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(habit.id);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge className="flex items-center gap-1">
          {CATEGORIES[habit.category].icon} {CATEGORIES[habit.category].label}
        </Badge>

        <Badge variant="outline">
          {habit.frequency === "daily" && "Daily"}
          {habit.frequency === "weekly" && "Weekly"}
          {habit.frequency === "custom" && "Custom days"}
        </Badge>

        <Badge variant="outline" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {habit.duration} {habit.duration === 1 ? "time" : "times"} per{" "}
          {habit.period.slice(0, -1)}
        </Badge>

        {habit.reminderEnabled && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {habit.reminderTime}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="calendar">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="pt-4">
          <HabitCalendar habit={habit} />
        </TabsContent>
        <TabsContent value="stats" className="pt-4">
          <HabitStats habit={habit} />
        </TabsContent>
      </Tabs>

      <div className="pt-4">
        <Button onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </div>
  );
};

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "today" | HabitCategory
  >("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Load habits from local storage
  useEffect(() => {
    const savedHabits = localStorage.getItem(STORAGE_KEY);
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (error) {
        console.error("Failed to parse saved habits:", error);
      }
    }
  }, []);

  // Save habits to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  // Handle creating a new habit
  const handleCreateHabit = (
    habitData: Omit<Habit, "id" | "createdAt" | "completedDates">
  ) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completedDates: [],
      duration: habitData.duration || 1,
      period: habitData.period || "days",
    };

    setHabits([...habits, newHabit]);
    setIsAddDialogOpen(false);

    toast({
      title: "Habit created",
      description: `${newHabit.name} has been added to your habits.`,
    });
  };

  // Handle updating a habit
  const handleUpdateHabit = (
    habitData: Omit<Habit, "id" | "createdAt" | "completedDates">
  ) => {
    if (!selectedHabit) return;

    const updatedHabit: Habit = {
      ...selectedHabit,
      ...habitData,
    };

    setHabits(
      habits.map((habit) =>
        habit.id === selectedHabit.id ? updatedHabit : habit
      )
    );

    setIsEditDialogOpen(false);
    setSelectedHabit(null);

    toast({
      title: "Habit updated",
      description: `${updatedHabit.name} has been updated.`,
    });
  };

  // Handle toggling a habit completion
  const handleToggleHabit = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    setHabits(
      habits.map((habit) => {
        if (habit.id !== id) return habit;

        const today = new Date().toISOString().split("T")[0];
        const isCompletedToday = habit.completedDates.some((date) =>
          date.startsWith(today)
        );

        if (isCompletedToday) {
          // Remove today's completion
          return {
            ...habit,
            completedDates: habit.completedDates.filter(
              (date) => !date.startsWith(today)
            ),
          };
        } else {
          // Add today's completion
          return {
            ...habit,
            completedDates: [...habit.completedDates, new Date().toISOString()],
          };
        }
      })
    );
  };

  // Handle deleting a habit
  const handleDeleteHabit = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const habitToDelete = habits.find((habit) => habit.id === id);
    if (!habitToDelete) return;

    setSelectedHabit(habitToDelete);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteHabit = () => {
    if (!selectedHabit) return;

    setHabits(habits.filter((habit) => habit.id !== selectedHabit.id));

    toast({
      title: "Habit deleted",
      description: `${selectedHabit.name} has been deleted.`,
    });

    setIsDeleteDialogOpen(false);
    setSelectedHabit(null);
  };

  // Handle editing a habit
  const handleEditHabit = (habit: Habit, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    setSelectedHabit(habit);
    setIsEditDialogOpen(true);
  };

  // Filter habits based on active filter
  const filteredHabits = habits.filter((habit) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "today") return shouldCompleteToday(habit);
    return habit.category === activeFilter;
  });

  // Calculate completion stats
  const completedToday = habits.filter((habit) =>
    habit.completedDates.some((date) => isSameDay(new Date(date), new Date()))
  ).length;

  const totalForToday = habits.filter((habit) =>
    shouldCompleteToday(habit)
  ).length;

  const completionPercentage =
    totalForToday > 0 ? Math.round((completedToday / totalForToday) * 100) : 0;

  return (
    <div className="container max-w-3xl mx-auto py-4 px-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Habit Tracker</h1>
          <p className="text-muted-foreground">
            Track your daily habits and build consistency
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[70vh]">
            <DialogTitle className="sr-only">Create a new habit</DialogTitle>
            <DialogHeader>
              <h2 className="text-lg font-semibold">Create a new habit</h2>
              <DialogDescription>
                Add a new habit to track. Be specific about what you want to
                achieve.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <HabitForm
                onSave={handleCreateHabit}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {habits.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Today's Progress
            </h2>
            <span className="text-sm font-medium">
              {completedToday}/{totalForToday} completed
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("all")}
          className="flex-shrink-0"
        >
          All
        </Button>
        <Button
          variant={activeFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveFilter("today")}
          className="flex-shrink-0"
        >
          Today
        </Button>

        {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
          <Button
            key={key}
            variant={activeFilter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(key as HabitCategory)}
            className="flex-shrink-0"
          >
            <span className="mr-1">{icon}</span>
            {label}
          </Button>
        ))}
      </div>

      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted rounded-full p-3 mb-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No habits yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Start tracking your habits to build consistency and achieve your
            goals.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Habit
          </Button>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">
            No habits match the current filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => {
                setSelectedHabit(habit);
                setIsDetailDialogOpen(true);
              }}
              className="cursor-pointer"
            >
              <HabitItem
                habit={habit}
                onToggle={handleToggleHabit}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[80vh]">
          <DialogTitle className="sr-only">Edit habit</DialogTitle>
          <DialogHeader>
            <h2 className="text-lg font-semibold">Edit habit</h2>
            <DialogDescription>Make changes to your habit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedHabit && (
              <HabitForm
                initialHabit={selectedHabit}
                onSave={handleUpdateHabit}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedHabit(null);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-md overflow-y-auto max-h-[80vh]">
          <DialogTitle className="sr-only">Habit Details</DialogTitle>
          <DialogHeader>
            <h2 className="text-lg font-semibold">Habit Details</h2>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedHabit && (
              <HabitDetail
                habit={selectedHabit}
                onClose={() => {
                  setIsDetailDialogOpen(false);
                  setSelectedHabit(null);
                }}
                onEdit={(habit) => {
                  setIsDetailDialogOpen(false);
                  setSelectedHabit(habit);
                  setIsEditDialogOpen(true);
                }}
                onDelete={handleDeleteHabit}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedHabit?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteHabit}
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
