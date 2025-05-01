import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { format, subDays, addDays, isSameDay, parseISO } from "date-fns";
import {
  Trash2,
  Edit,
  MoreVertical,
  Dumbbell,
  Brain,
  BookOpen,
  Music2,
  Code2,
  Palette,
  Heart,
  Coffee,
  UtensilsCrossed,
  Moon,
  Timer,
  Target,
  GraduationCap,
  Gamepad2,
  Bike,
  Dog,
  Cat,
  PenLine,
  Star,
  CalendarDays,
  HelpCircle,
  ArrowRight,
  Check,
  ActivitySquare,
  Flame,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconBolt,
  IconCalendar,
  IconFlame,
  IconPlus,
  IconMinus,
  IconBook,
  IconRun,
  IconGlass,
  IconBed,
  IconApple,
  IconBike,
  IconDeviceLaptop,
} from "@tabler/icons-react";
import { Textarea } from "@/components/ui/textarea";
import { HabitReminderPicker } from "@/components/ui/habit-reminder-picker";
import { sendHabitReminder } from "@/lib/notification";

// Update FrequencyType to include more options
type FrequencyType = "daily" | "weekly" | "monthly" | "yearly" | "none";

// Type for habit icons
type HabitIconType = (typeof HABIT_ICONS)[number];

type CategoryType =
  | "health"
  | "productivity"
  | "fitness"
  | "mindfulness"
  | "learning"
  | "finance"
  | "social"
  | "other"
  | "custom";

interface Reminder {
  id: string;
  time: string;
  days: string[];
  advance?: {
    value: number;
    unit: "minutes" | "hours" | "days" | "weeks";
  };
}

// Updated Habit interface to include both original properties and new ones
interface Habit {
  id: string;
  name: string;
  icon: HabitIconType | React.ReactNode;
  color: string;
  frequency?: FrequencyType;
  completedDates?: string[];
  createdAt?: string;
  updatedAt?: string;
  reminders?: Reminder[];
  description?: string;
  category?: CategoryType;
  streak: number;
  completionsToday?: number;
  completionsPerDay?: number;
  lastCompletedDate?: string;
  dailyGoal: number;
  currentStreak?: number;
  currentCount?: number;
  completions?: {
    date: string;
    count: number;
  }[];
}

// Define the icon types first
const HABIT_ICONS = [
  "Exercise",
  "Mindfulness",
  "Reading",
  "Music",
  "Coding",
  "Art",
  "Health",
  "Coffee",
  "Eating",
  "Sleep",
  "Timer",
  "Goal",
  "Writing",
  "Learning",
  "Gaming",
  "Cycling",
  "Dog",
  "Cat",
] as const;

// Define the icon mapping
const ICON_MAP: Record<HabitIconType, LucideIcon> = {
  Exercise: Dumbbell,
  Mindfulness: Brain,
  Reading: BookOpen,
  Music: Music2,
  Coding: Code2,
  Art: Palette,
  Health: Heart,
  Coffee: Coffee,
  Eating: UtensilsCrossed,
  Sleep: Moon,
  Timer: Timer,
  Goal: Target,
  Writing: PenLine,
  Learning: GraduationCap,
  Gaming: Gamepad2,
  Cycling: Bike,
  Dog: Dog,
  Cat: Cat,
};

// Available colors for habits
const HABIT_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#a855f7", // purple
  "#f43f5e", // rose
  "#84cc16", // lime
  "#eab308", // yellow
  "#22c55e", // green
  "#6366f1", // indigo
  "#d946ef", // fuchsia
  "#0ea5e9", // sky
];

// Add custom category option to CATEGORIES
const CATEGORIES: Record<CategoryType, { label: string; icon: HabitIconType }> =
  {
    health: { label: "Health", icon: "Health" },
    productivity: { label: "Productivity", icon: "Timer" },
    fitness: { label: "Fitness", icon: "Exercise" },
    mindfulness: { label: "Mindfulness", icon: "Mindfulness" },
    learning: { label: "Learning", icon: "Learning" },
    finance: { label: "Finance", icon: "Goal" },
    social: { label: "Social", icon: "Health" },
    other: { label: "Other", icon: "Goal" },
    custom: { label: "Custom", icon: "Goal" }, // Add custom category
  };

// Constants
const LOCAL_STORAGE_KEY = "focusbrew_habits";
const DEFAULT_HEATMAP_DAYS = 30; // Total days to show (today + 29 future days)

const DEFAULT_HABIT: Omit<Habit, "id"> = {
  name: "",
  icon: "Exercise",
  color: "#000000",
  frequency: "daily",
  completedDates: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  reminders: [],
  category: "other",
  streak: 0,
  completionsToday: 0,
  completionsPerDay: 1,
  lastCompletedDate: "",
  dailyGoal: 0,
  currentStreak: 0,
  completions: [],
};

// Helper to get frequency text
const getFrequencyText = (frequency: FrequencyType): string => {
  switch (frequency) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    case "none":
      return "None";
    default:
      return frequency;
  }
};

// Icon component for habit icons
interface IconProps {
  name: HabitIconType | keyof typeof CATEGORIES;
  className?: string;
  style?: React.CSSProperties;
}

const Icon = ({ name, className, style }: IconProps) => {
  if (name in ICON_MAP) {
    const IconComponent = ICON_MAP[name as HabitIconType];
    return <IconComponent className={className} style={style} />;
  }

  // For category icons
  if (name in CATEGORIES) {
    const categoryIcon = CATEGORIES[name as keyof typeof CATEGORIES].icon;
    const IconComponent = ICON_MAP[categoryIcon];
    return <IconComponent className={className} style={style} />;
  }

  // Fallback
  return <Star className={className} style={style} />;
};

interface IconSelectorProps {
  selectedIcon: HabitIconType;
  onSelect: (icon: HabitIconType) => void;
}

function IconSelector({ selectedIcon, onSelect }: IconSelectorProps) {
  return (
    <div className="grid grid-cols-6 gap-2 p-2">
      {HABIT_ICONS.map((icon) => (
        <button
          key={icon}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent",
            selectedIcon === icon && "bg-accent"
          )}
          onClick={() => onSelect(icon)}
        >
          <Icon name={icon} className="h-6 w-6" />
        </button>
      ))}
    </div>
  );
}

// Component to display a GitHub-like heatmap with improved interaction
const HabitHeatmap = ({ habit }: { habit: Habit }) => {
  const today = new Date();
  const cells = [];

  // Generate dates for the heatmap (today and future)
  for (let i = 0; i < DEFAULT_HEATMAP_DAYS; i++) {
    const date = addDays(today, i);
    const dateISO = date.toISOString();
    const isCompleted =
      habit.completedDates?.some((d) => isSameDay(parseISO(d), date)) || false;
    const isToday = i === 0;
    const isFuture = i > 0;

    // Calculate day label for tooltip
    const dayLabel = isToday ? "Today" : i === 1 ? "Tomorrow" : `In ${i} days`;

    cells.push(
      <TooltipProvider key={dateISO}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "w-4 h-4 rounded-sm cursor-pointer transition-colors relative",
                isCompleted
                  ? "hover:opacity-80"
                  : "bg-gray-100 dark:bg-gray-800 hover:opacity-50",
                isFuture &&
                  "border border-dashed border-gray-300 dark:border-gray-700"
              )}
              style={{
                backgroundColor: isCompleted ? habit.color : "",
                opacity: isCompleted ? 1 : 0.15,
              }}
              onClick={() => {
                const customEvent = new CustomEvent("toggle-habit-date", {
                  detail: { habitId: habit.id, date },
                });
                window.dispatchEvent(customEvent);
              }}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{format(date, "PPP")}</p>
            <p className="text-xs text-muted-foreground">{dayLabel}</p>
            <p className="text-xs text-muted-foreground">
              {isCompleted ? "✅ Completed" : "❌ Not completed"}
            </p>
            {isFuture && <p className="text-xs text-blue-500">Future date</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Next {DEFAULT_HEATMAP_DAYS} Days
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p>How it works:</p>
                  <ul className="list-disc pl-4 text-xs space-y-1">
                    <li>Click on days to mark them as completed</li>
                    <li>Plan ahead by marking future dates</li>
                    <li>Track your progress over time</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Not completed</span>
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: habit.color }}
          ></div>
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        <div className="flex items-center mb-1 mr-1">
          <span className="text-xs text-muted-foreground mr-2">Today</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </div>
        {cells}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          <span>Click on squares to mark completion for any day</span>
        </div>
      </div>
    </div>
  );
};

// Função auxiliar para calcular streak atual
const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates.length) return 0;

  // Ordenar datas de completude em ordem decrescente (mais recente primeiro)
  const sortedDates = [...completedDates]
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  // Verificar se a data mais recente é hoje ou ontem (para manter streak ativo)
  const mostRecentDate = sortedDates[0];
  const today = new Date();
  const yesterday = subDays(today, 1);

  if (
    !isSameDay(mostRecentDate, today) &&
    !isSameDay(mostRecentDate, yesterday)
  ) {
    return 0; // Streak quebrado se a data mais recente não for hoje ou ontem
  }

  let streak = 1; // Começar com 1 para a data mais recente
  let currentDate = mostRecentDate;

  // Verificar dias consecutivos para trás
  for (let i = 1; i < sortedDates.length; i++) {
    const expectedPrevDate = subDays(currentDate, 1);
    if (isSameDay(sortedDates[i], expectedPrevDate)) {
      streak++;
      currentDate = sortedDates[i];
    } else {
      break; // Streak quebrado
    }
  }

  return streak;
};

// Função auxiliar para calcular o melhor streak
const calculateLongestStreak = (completedDates: string[]): number => {
  if (!completedDates.length) return 0;

  // Ordenar datas de completude
  const sortedDates = [...completedDates]
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const previousDate = sortedDates[i - 1];
    const currentDate = sortedDates[i];
    const expectedDate = addDays(previousDate, 1);

    if (isSameDay(currentDate, expectedDate)) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1; // Reiniciar streak atual
    }
  }

  return longestStreak;
};

// Calculate completion rate
const calculateCompletionRate = (habit: Habit): number => {
  const stats = calculateCompletionStats(habit.completedDates || []);
  return Math.round((stats.last30Days / 30) * 100);
};

// Calculate completion stats
const calculateCompletionStats = (completedDates: string[]) => {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i));
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(today, i));

  // Converter strings de data para objetos Date
  const completedDateObjects = completedDates.map((date) => new Date(date));

  // Verificar se uma data está nos objetos de datas completadas
  const isDateCompleted = (date: Date) =>
    completedDateObjects.some((d) => isSameDay(d, date));

  // Completude para hoje
  const isCompletedToday = isDateCompleted(today);

  // Completude para os últimos 7 dias
  const completed7Days = last7Days.filter(isDateCompleted).length;

  // Completude para os últimos 30 dias
  const completed30Days = last30Days.filter(isDateCompleted).length;

  return {
    today: isCompletedToday ? 1 : 0,
    last7Days: completed7Days,
    last30Days: completed30Days,
  };
};

// Display completion percentage with improved context
const CompletionLabel = ({ habit }: { habit: Habit }) => {
  // Safe access to completedDates
  const completedDates = habit.completedDates || [];

  // Calculate completion rate with the non-null completedDates
  const stats = calculateCompletionStats(completedDates);
  const completionRate = Math.round((stats.last30Days / 30) * 100);

  const getLabelText = () => {
    if (!habit.frequency || habit.frequency === "none") {
      return `${completionRate}% complete`;
    } else if (habit.frequency === "daily") {
      return `${completionRate}% complete (${DEFAULT_HEATMAP_DAYS} days)`;
    } else if (habit.frequency === "weekly") {
      return `${completionRate}% complete (last 4 weeks)`;
    } else if (habit.frequency === "monthly") {
      return `${completionRate}% complete (last 3 months)`;
    } else {
      return `${completionRate}% complete (this year)`;
    }
  };

  return <span className="text-muted-foreground">{getLabelText()}</span>;
};

// Helper to schedule habit reminders
const scheduleHabitReminder = (habit: Habit) => {
  if (!habit.reminders) return;

  habit.reminders.forEach((reminder) => {
    const now = new Date();
    const eventTime = new Date(reminder.time);

    // Calculate the reminder time based on advance settings
    let reminderTime = new Date(eventTime);
    if (reminder.advance) {
      const { value, unit } = reminder.advance;

      // Subtract the advance time from the event time
      switch (unit) {
        case "minutes":
          reminderTime.setMinutes(reminderTime.getMinutes() - value);
          break;
        case "hours":
          reminderTime.setHours(reminderTime.getHours() - value);
          break;
        case "days":
          reminderTime.setDate(reminderTime.getDate() - value);
          break;
        case "weeks":
          reminderTime.setDate(reminderTime.getDate() - value * 7);
          break;
      }
    }

    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      setTimeout(() => {
        // Show toast notification
        toast.info(`Habit Reminder: ${habit.name}`, {
          description: `Your habit is scheduled to be completed soon!`,
        });

        // Use the sendHabitReminder function for browser notifications
        sendHabitReminder(habit.name, habit.frequency || "daily");

        // Schedule next reminder based on the habit frequency
        const frequency = habit.frequency || "daily";
        const nextEventTime = new Date(eventTime);

        // Adjust reminder date based on frequency
        switch (frequency) {
          case "daily":
            nextEventTime.setDate(nextEventTime.getDate() + 1);
            break;
          case "weekly":
            nextEventTime.setDate(nextEventTime.getDate() + 7);
            break;
          case "monthly":
            nextEventTime.setMonth(nextEventTime.getMonth() + 1);
            break;
          case "yearly":
            nextEventTime.setFullYear(nextEventTime.getFullYear() + 1);
            break;
          default:
            // For "none", don't schedule further reminders
            return;
        }

        reminder.time = nextEventTime.toISOString();
        // Schedule the next reminder
        scheduleHabitReminder(habit);
      }, timeUntilReminder);
    }
  });
};

// Componente Stat para mostrar estatísticas
const Stat = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
};

// Update the HabitStats component to be consistent
const HabitStats = ({ habit }: { habit: Habit }) => {
  const currentStreak = calculateStreak(habit.completedDates || []);
  const longestStreak = calculateLongestStreak(habit.completedDates || []);
  const stats = calculateCompletionStats(habit.completedDates || []);
  const completionRate = calculateCompletionRate(habit);

  return (
    <div className="flex flex-col p-4 pb-2 pt-2 bg-background rounded-md border shadow-sm">
      <div className="flex flex-row justify-between mb-2">
        <Stat label="Current Streak" value={`${currentStreak} days`} />
        <Stat label="Best Streak" value={`${longestStreak} days`} />
      </div>
      <div className="flex flex-row justify-between">
        <Stat label="Last 7 days" value={`${stats.last7Days}/7`} />
        <Stat label="Last 30 days" value={`${stats.last30Days}/30`} />
      </div>
      <div className="mt-2">
        <div className="text-xs text-muted-foreground mb-1">
          {completionRate}% complete (30 days)
        </div>
        <Progress value={completionRate} className="h-1" />
      </div>
    </div>
  );
};

// Enhanced color options for habits
const colorOptions = [
  { name: "Verde", value: "#10b981" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Âmbar", value: "#f59e0b" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Ciano", value: "#06b6d4" },
  { name: "Esmeralda", value: "#14b8a6" },
  { name: "Lima", value: "#84cc16" },
  { name: "Índigo", value: "#6366f1" },
];

// Updated HabitForm interface to support editing
const HabitForm = ({
  initialHabit,
  onSave,
  onClose,
}: {
  initialHabit?: Habit | null;
  onSave: (habit: Omit<Habit, "id" | "currentCount" | "streak">) => void;
  onClose: () => void;
}) => {
  const [name, setName] = useState(initialHabit?.name || "");
  const [description, setDescription] = useState(
    initialHabit?.description || ""
  );
  const [selectedIcon, setSelectedIcon] = useState<React.ReactNode>(
    initialHabit?.icon || <IconBolt />
  );
  const [selectedColor, setSelectedColor] = useState(
    initialHabit?.color || colorOptions[0].value
  );
  const [dailyGoal, setDailyGoal] = useState(initialHabit?.dailyGoal || 1);
  const [streakGoal, setStreakGoal] = useState<FrequencyType>(
    (initialHabit?.frequency as FrequencyType) || "daily"
  );
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [reminderAdvance, setReminderAdvance] = useState<{
    value: number;
    unit: "minutes" | "hours" | "days" | "weeks";
  }>({
    value: 30,
    unit: "minutes",
  });

  const incrementGoal = () => setDailyGoal((prev) => prev + 1);
  const decrementGoal = () => setDailyGoal((prev) => Math.max(1, prev - 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newHabit: Omit<Habit, "id" | "currentCount" | "streak"> = {
      name,
      description,
      icon: selectedIcon,
      color: selectedColor,
      dailyGoal,
      frequency: streakGoal as FrequencyType,
    };

    // Add reminder if enabled
    if (showReminder && reminderTime) {
      // Get the time part but set to today's date to ensure it's correctly evaluated
      const reminderDate = new Date(reminderTime);

      // If time already passed today, set for tomorrow
      if (reminderDate < new Date()) {
        reminderDate.setDate(reminderDate.getDate() + 1);
      }

      newHabit.reminders = [
        {
          id: Date.now().toString(),
          time: reminderDate.toISOString(),
          days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          advance: reminderAdvance,
        },
      ];
    }

    onSave(newHabit);
    onClose();
  };

  // Initialize reminder state if habit has reminders
  useEffect(() => {
    if (initialHabit?.reminders && initialHabit.reminders.length > 0) {
      setShowReminder(true);
      setReminderTime(new Date(initialHabit.reminders[0].time));
      if (initialHabit.reminders[0].advance) {
        setReminderAdvance(initialHabit.reminders[0].advance);
      }
    }
  }, [initialHabit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Habit name"
          required
          className="rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description (optional)
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the habit"
          rows={2}
          className="rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Icon</Label>
        <div className="grid grid-cols-5 gap-2">
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconBolt
            )}
            onClick={() => setSelectedIcon(<IconBolt />)}
            icon={<IconBolt size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconFlame
            )}
            onClick={() => setSelectedIcon(<IconFlame />)}
            icon={<IconFlame size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconCalendar
            )}
            onClick={() => setSelectedIcon(<IconCalendar />)}
            icon={<IconCalendar size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconBook
            )}
            onClick={() => setSelectedIcon(<IconBook />)}
            icon={<IconBook size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconRun
            )}
            onClick={() => setSelectedIcon(<IconRun />)}
            icon={<IconRun size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconGlass
            )}
            onClick={() => setSelectedIcon(<IconGlass />)}
            icon={<IconGlass size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconBed
            )}
            onClick={() => setSelectedIcon(<IconBed />)}
            icon={<IconBed size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconApple
            )}
            onClick={() => setSelectedIcon(<IconApple />)}
            icon={<IconApple size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconBike
            )}
            onClick={() => setSelectedIcon(<IconBike />)}
            icon={<IconBike size={20} />}
          />
          <IconButton
            selected={Boolean(
              selectedIcon && (selectedIcon as any).type === IconDeviceLaptop
            )}
            onClick={() => setSelectedIcon(<IconDeviceLaptop />)}
            icon={<IconDeviceLaptop size={20} />}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Color</Label>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((color) => (
            <div
              key={color.value}
              className={`h-6 w-6 rounded-full cursor-pointer border transition-all ${
                selectedColor === color.value
                  ? "ring-2 ring-offset-2 ring-offset-background"
                  : "hover:scale-110"
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => setSelectedColor(color.value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Completions per day</Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={decrementGoal}
          >
            <IconMinus size={14} />
          </Button>
          <span className="w-8 text-center font-medium">{dailyGoal}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={incrementGoal}
          >
            <IconPlus size={14} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streak-goal" className="text-sm font-medium">
          Streak goal
        </Label>
        <Select
          value={streakGoal}
          onValueChange={(value: FrequencyType) => setStreakGoal(value)}
        >
          <SelectTrigger id="streak-goal" className="h-9">
            <SelectValue placeholder="Select a goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <HabitReminderPicker
        enabled={showReminder}
        onEnabledChange={setShowReminder}
        time={reminderTime}
        onTimeChange={setReminderTime}
        frequency={streakGoal}
        reminderAdvance={reminderAdvance}
        onReminderAdvanceChange={setReminderAdvance}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className=""
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" className="">
          {initialHabit ? "Update Habit" : "Create Habit"}
        </Button>
      </div>
    </form>
  );
};

// IconButton corrigido
const IconButton = ({
  selected,
  onClick,
  icon,
}: {
  selected: boolean | null | undefined;
  onClick: () => void;
  icon: React.ReactNode;
}) => (
  <div
    className={`flex justify-center items-center h-8 rounded-lg cursor-pointer border transition-all ${
      selected
        ? "bg-primary/10 border-primary/30"
        : "border-border hover:border-foreground/20"
    }`}
    onClick={onClick}
  >
    {icon}
  </div>
);

// Add the missing interface
interface HabitItemProps {
  habit: Habit;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

const HabitItem = ({
  habit,
  onIncrement,
  onDecrement,
  onEdit,
  onDelete,
}: HabitItemProps) => {
  const { id, name, icon, color, dailyGoal, currentCount = 0, streak } = habit;

  const incrementCompletion = () => {
    if (currentCount < dailyGoal) {
      onIncrement(id);
    }
  };

  const decrementCompletion = () => {
    onDecrement(id);
  };

  const progressPercentage = (currentCount / dailyGoal) * 100;
  const isCompleted = currentCount >= dailyGoal;

  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:border-border/80 transition-colors h-full shadow-sm hover:shadow-md">
      <div className="flex h-2" style={{ backgroundColor: color }} />
      <div className="p-4 sm:p-5 flex flex-col h-[calc(100%-0.5rem)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
            <h3 className="font-medium truncate max-w-[120px] sm:max-w-[180px]">
              {name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" />
              <span>{streak}</span>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start h-9 px-2"
                    onClick={() => onEdit(habit)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start h-9 px-2 text-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => onDelete(id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2 mb-4 flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline text-sm">
              <span className="font-semibold">{currentCount}</span>
              <span className="text-muted-foreground ml-1">/ {dailyGoal}</span>
            </div>
            <span
              className={`font-medium text-xs sm:text-sm ${
                isCompleted ? "text-green-500" : "text-muted-foreground"
              }`}
            >
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2 w-full rounded-full"
            style={isCompleted ? { color: "rgb(34, 197, 94)" } : undefined}
          />
        </div>

        <div className="pt-2 mt-auto">
          {isCompleted ? (
            <Button
              onClick={decrementCompletion}
              size="sm"
              variant="outline"
              className="w-full text-xs sm:text-sm border-green-500 text-green-500"
            >
              <Check className="h-3.5 w-3.5 mr-1 sm:h-4 sm:w-4 text-green-500" />
              Unmark Complete
            </Button>
          ) : (
            <Button
              onClick={incrementCompletion}
              size="sm"
              variant="default"
              className="w-full text-xs sm:text-sm"
            >
              <Check className="h-3.5 w-3.5 mr-1 sm:h-4 sm:w-4" />
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Add a useEffect to schedule reminders when habits change
  useEffect(() => {
    habits.forEach((habit) => {
      if (habit.reminders && habit.reminders.length > 0) {
        scheduleHabitReminder(habit);
      }
    });
  }, [habits]);

  const handleSaveHabit = (
    newHabit: Omit<Habit, "id" | "currentCount" | "streak">
  ) => {
    if (editingHabit) {
      // Update existing habit
      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit.id === editingHabit.id
            ? {
                ...habit,
                ...newHabit,
                currentCount: habit.currentCount,
                streak: habit.streak,
              }
            : habit
        )
      );
      setEditingHabit(null);
    } else {
      // Create new habit
      const habit: Habit = {
        ...newHabit,
        id: Date.now().toString(),
        currentCount: 0,
        streak: 0,
      };
      setHabits((prev) => [...prev, habit]);
    }
  };

  // Handle habit increment
  const handleIncrementHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id
          ? { ...habit, currentCount: (habit.currentCount || 0) + 1 }
          : habit
      )
    );
  };

  // Handle habit decrement to allow unmarking completed habits
  const handleDecrementHabit = (id: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              currentCount: Math.max(0, (habit.currentCount || 0) - 1),
            }
          : habit
      )
    );
  };

  // Handle edit habit
  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsDialogOpen(true);
  };

  // Handle delete habit
  const handleDeleteHabit = (id: string) => {
    // Limpar o estado de edição se o hábito sendo excluído for o mesmo que está sendo editado
    if (editingHabit && editingHabit.id === id) {
      setEditingHabit(null);
    }
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== id));
  };

  // Filter habits based on the active filter
  const filteredHabits = habits.filter((habit) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "completed")
      return (habit.currentCount || 0) >= habit.dailyGoal;
    if (activeFilter === "pending")
      return (habit.currentCount || 0) < habit.dailyGoal;
    return true;
  });

  // Close dialog and reset editing state
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingHabit(null);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="border-b py-4">
        <div className="container flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium">My Habits</h2>
            <p className="text-sm text-muted-foreground">
              Track and develop consistent habits
            </p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              // Limpar o estado de edição ao abrir o diálogo caso não esteja editando
              if (open && !editingHabit) {
                setEditingHabit(null);
              }
              setIsDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="gap-1"
                onClick={() => setEditingHabit(null)}
              >
                <IconPlus size={16} />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingHabit ? "Edit Habit" : "Create New Habit"}
                </DialogTitle>
                <DialogDescription>
                  {editingHabit
                    ? "Update your habit details."
                    : "Add habits to track your daily consistency."}
                </DialogDescription>
              </DialogHeader>
              <HabitForm
                initialHabit={editingHabit}
                onSave={handleSaveHabit}
                onClose={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="container py-6 flex-1">
        {habits.length === 0 ? (
          <div className="bg-background border border-border rounded-xl flex flex-col items-center justify-center py-12 px-4 h-[400px]">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <IconBolt size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No habits yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto text-center">
              Start tracking your daily habits to build consistency and reach
              your goals.
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="default"
              size="sm"
              className="gap-1"
            >
              <IconPlus size={16} />
              Add Your First Habit
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-medium">Active Habits</h3>
                <p className="text-sm text-muted-foreground">
                  {filteredHabits.length}{" "}
                  {filteredHabits.length === 1 ? "habit" : "habits"}{" "}
                  {activeFilter !== "all" && `(${activeFilter})`}
                </p>
              </div>

              <div className="flex items-center">
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Filter by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All habits</SelectItem>
                    <SelectItem value="completed">Completed today</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredHabits.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 mt-10">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <ActivitySquare className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No habits found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeFilter === "completed"
                    ? "None of your habits have been completed today."
                    : activeFilter === "pending"
                    ? "All of your habits have been completed today. Great job!"
                    : "No habits match the current filter."}
                </p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredHabits.map((habit) => (
                    <HabitItem
                      key={habit.id}
                      habit={habit}
                      onIncrement={handleIncrementHabit}
                      onDecrement={handleDecrementHabit}
                      onEdit={handleEditHabit}
                      onDelete={handleDeleteHabit}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
