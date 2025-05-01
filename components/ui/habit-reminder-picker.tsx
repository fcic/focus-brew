"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast, showNotificationPermissionToast } from "@/lib/toast";
import { isBrowserNotificationSupported } from "@/lib/notification";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HabitReminderPickerProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  time: Date | null;
  onTimeChange: (time: Date | null) => void;
  frequency?: "daily" | "weekly" | "monthly" | "yearly" | "none";
  reminderAdvance?: {
    value: number;
    unit: "minutes" | "hours" | "days" | "weeks";
  };
  onReminderAdvanceChange?: (advance: {
    value: number;
    unit: "minutes" | "hours" | "days" | "weeks";
  }) => void;
}

const FormSchema = z.object({
  time: z.date({
    required_error: "A date and time is required.",
  }),
});

// Adicionar um helper para validação do tempo de antecedência com base na frequência
const getMaxAdvanceForFrequency = (
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "none"
) => {
  switch (frequency) {
    case "daily":
      return { value: 12, unit: "hours" as const };
    case "weekly":
      return { value: 2, unit: "days" as const };
    case "monthly":
      return { value: 7, unit: "days" as const };
    case "yearly":
      return { value: 30, unit: "days" as const };
    case "none":
      return { value: 1, unit: "hours" as const };
  }
};

// Converter um tempo de antecedência para minutos para facilitar comparação
const convertToMinutes = (
  value: number,
  unit: "minutes" | "hours" | "days" | "weeks"
) => {
  switch (unit) {
    case "minutes":
      return value;
    case "hours":
      return value * 60;
    case "days":
      return value * 24 * 60;
    case "weeks":
      return value * 7 * 24 * 60;
  }
};

export function HabitReminderPicker({
  enabled,
  onEnabledChange,
  time,
  onTimeChange,
  frequency = "daily",
  reminderAdvance = { value: 30, unit: "minutes" },
  onReminderAdvanceChange = () => {},
}: HabitReminderPickerProps) {
  const [notificationPermission, setNotificationPermission] = useState<
    string | null
  >(null);
  const [advanceValue, setAdvanceValue] = useState(reminderAdvance.value);
  const [advanceUnit, setAdvanceUnit] = useState<
    "minutes" | "hours" | "days" | "weeks"
  >(reminderAdvance.unit);
  const [advanceWarning, setAdvanceWarning] = useState<string | null>(null);

  // Validar o tempo de antecedência em relação à frequência
  useEffect(() => {
    const maxAdvance = getMaxAdvanceForFrequency(frequency);
    const currentAdvanceInMinutes = convertToMinutes(advanceValue, advanceUnit);
    const maxAdvanceInMinutes = convertToMinutes(
      maxAdvance.value,
      maxAdvance.unit
    );

    if (currentAdvanceInMinutes > maxAdvanceInMinutes) {
      setAdvanceWarning(
        `A reminder ${advanceValue} ${advanceUnit} before might be too early for a ${frequency} habit. Consider using ${maxAdvance.value} ${maxAdvance.unit} or less.`
      );
    } else {
      setAdvanceWarning(null);
    }

    // Check if selected time with advance has already passed today
    if (time) {
      const eventTime = new Date(time);
      const now = new Date();

      // Calculate reminder time by subtracting the advance time
      const reminderTime = new Date(eventTime);
      switch (advanceUnit) {
        case "minutes":
          reminderTime.setMinutes(reminderTime.getMinutes() - advanceValue);
          break;
        case "hours":
          reminderTime.setHours(reminderTime.getHours() - advanceValue);
          break;
        case "days":
          reminderTime.setDate(reminderTime.getDate() - advanceValue);
          break;
        case "weeks":
          reminderTime.setDate(reminderTime.getDate() - advanceValue * 7);
          break;
      }

      if (reminderTime < now) {
        // If we're dealing with a daily habit and the reminder time has passed today
        if (frequency === "daily") {
          setAdvanceWarning(
            `This reminder time has already passed for today. The first notification will be for tomorrow.`
          );
        }
      }
    }
  }, [frequency, advanceValue, advanceUnit, time]);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    onReminderAdvanceChange({
      value: advanceValue,
      unit: advanceUnit,
    });
  }, [advanceValue, advanceUnit, onReminderAdvanceChange]);

  const getReminderLabel = () => {
    switch (frequency) {
      case "daily":
        return "Daily Reminder";
      case "weekly":
        return "Weekly Reminder";
      case "monthly":
        return "Monthly Reminder";
      case "yearly":
        return "Yearly Reminder";
      default:
        return "Reminder";
    }
  };

  const handleToggleReminder = async (checked: boolean) => {
    if (checked) {
      if (!isBrowserNotificationSupported()) {
        toast.error("Notifications not supported", {
          description: "Your browser does not support notifications.",
        });
        onEnabledChange(false);
        return;
      }

      if (Notification.permission !== "granted") {
        try {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
          showNotificationPermissionToast(permission);

          if (permission === "granted") {
            onEnabledChange(true);
          } else {
            onEnabledChange(false);
            return;
          }
        } catch (error) {
          console.error("Error requesting notification permission:", error);
          toast.error("Could not request notification permission.");
          onEnabledChange(false);
          return;
        }
      } else {
        onEnabledChange(true);
      }
    } else {
      onEnabledChange(false);
    }
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      time: time || new Date(),
    },
  });

  const handleValueChange = (date: Date) => {
    onTimeChange(date);
  };

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      const currentTime = form.getValues("time") || new Date();
      const newDate = new Date(date);
      newDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
      form.setValue("time", newDate);
      handleValueChange(newDate);
    }
  }

  function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
    const currentDate = form.getValues("time") || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      const isPM = newDate.getHours() >= 12;
      newDate.setHours(isPM ? hour + 12 : hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    form.setValue("time", newDate);
    handleValueChange(newDate);
  }

  const handleAdvanceValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setAdvanceValue(value);
    }
  };

  // Modificar a função handleAdvanceUnitChange para ajustar valores
  const handleAdvanceUnitChange = (
    unit: "minutes" | "hours" | "days" | "weeks"
  ) => {
    // Ajustar valores automaticamente para serem mais razoáveis
    // quando o usuário muda a unidade
    let newValue = advanceValue;
    if (unit === "days" && advanceUnit === "minutes" && advanceValue > 60) {
      newValue = Math.ceil(advanceValue / 60 / 24); // Convert minutes to days
    } else if (
      unit === "hours" &&
      advanceUnit === "minutes" &&
      advanceValue > 60
    ) {
      newValue = Math.ceil(advanceValue / 60); // Convert minutes to hours
    } else if (
      unit === "weeks" &&
      (advanceUnit === "minutes" || advanceUnit === "hours")
    ) {
      newValue = 1; // Default to 1 week when changing from smaller units
    } else if (unit === "minutes" && advanceUnit === "days") {
      newValue = Math.min(720, advanceValue * 24 * 60); // Convert days to minutes, cap at 12 hours
    } else if (unit === "minutes" && advanceUnit === "weeks") {
      newValue = 720; // Cap at 12 hours when changing from weeks to minutes
    }

    setAdvanceValue(newValue);
    setAdvanceUnit(unit);
  };

  const getAdvanceText = () => {
    if (advanceValue === 1) {
      if (advanceUnit === "minutes") return "1 minute before";
      if (advanceUnit === "hours") return "1 hour before";
      if (advanceUnit === "days") return "1 day before";
      if (advanceUnit === "weeks") return "1 week before";
    }
    return `${advanceValue} ${advanceUnit} before`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="reminder" className="text-sm font-medium">
          {getReminderLabel()}
        </Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="reminder-toggle"
            checked={enabled}
            onCheckedChange={(checked) =>
              handleToggleReminder(checked as boolean)
            }
          />
          <Label htmlFor="reminder-toggle" className="text-sm cursor-pointer">
            Enable
          </Label>
        </div>
      </div>

      {notificationPermission === "denied" && (
        <Alert className="border bg-muted/50">
          <AlertDescription className="text-xs">
            Notifications are blocked in your browser settings.
          </AlertDescription>
        </Alert>
      )}

      {enabled && (
        <Form {...form}>
          <div className="space-y-4">
            {/* Date selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-10 w-full justify-between"
                      >
                        {field.value ? (
                          format(field.value, "MMM d, yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            {/* Time selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={
                    form.getValues("time")
                      ? (
                          form.getValues("time").getHours() % 12 || 12
                        ).toString()
                      : "12"
                  }
                  onValueChange={(value) => handleTimeChange("hour", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={
                    form.getValues("time")
                      ? form.getValues("time").getMinutes().toString()
                      : "0"
                  }
                  onValueChange={(value) => handleTimeChange("minute", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Minute" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                      <SelectItem key={minute} value={minute.toString()}>
                        {minute.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={
                    form.getValues("time")
                      ? form.getValues("time").getHours() >= 12
                        ? "PM"
                        : "AM"
                      : "AM"
                  }
                  onValueChange={(value) => handleTimeChange("ampm", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reminder settings */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notification</Label>
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap text-sm">Remind</Label>
                <Input
                  type="number"
                  min="1"
                  value={advanceValue.toString()}
                  onChange={handleAdvanceValueChange}
                  className="w-full h-10 text-center"
                />
                <Select
                  value={advanceUnit}
                  onValueChange={(
                    value: "minutes" | "hours" | "days" | "weeks"
                  ) => handleAdvanceUnitChange(value)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">minutes</SelectItem>
                    <SelectItem value="hours">hours</SelectItem>
                    <SelectItem value="days">days</SelectItem>
                    <SelectItem value="weeks">weeks</SelectItem>
                  </SelectContent>
                </Select>
                <Label className="whitespace-nowrap text-sm">before</Label>
              </div>
            </div>

            {advanceWarning && (
              <Alert className="border bg-muted/50">
                <AlertDescription className="text-xs">
                  {advanceWarning}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </Form>
      )}
    </div>
  );
}
