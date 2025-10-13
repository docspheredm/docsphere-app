"use client";

import { Reminder } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReminderCardProps {
  reminder: Reminder;
  onDelete: (id: string) => void;
  onSnooze: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
}

export function ReminderCard({ reminder, onDelete, onSnooze, onToggleComplete, onEdit }: ReminderCardProps) {
  const reminderDate = new Date(reminder.dateTime);
  const isPast = reminderDate < new Date() && !reminder.completed;

  const formatDate = () => {
    const now = new Date();
    if (isToday(reminderDate)) {
      return `Today at ${format(reminderDate, 'p')}`;
    }
    if (isTomorrow(reminderDate)) {
      return `Tomorrow at ${format(reminderDate, 'p')}`;
    }
    if (reminderDate > now) {
      return format(reminderDate, 'MMM d, yyyy \'at\' p');
    }
    return `${formatDistanceToNow(reminderDate, { addSuffix: true })}`;
  };

  return (
    <Card
      className={cn(
        'transition-all duration-300',
        reminder.completed ? 'bg-card/50 opacity-60' : 'bg-card',
        isPast && 'border-destructive/50 ring-1 ring-destructive/20'
      )}
    >
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Checkbox
            id={`reminder-${reminder.id}`}
            checked={reminder.completed}
            onCheckedChange={() => onToggleComplete(reminder.id)}
            className="mt-1"
            aria-label={`Mark reminder as ${reminder.completed ? 'incomplete' : 'complete'}`}
          />
          <div className="grid gap-1">
            <label
              htmlFor={`reminder-${reminder.id}`}
              className={cn('font-medium leading-none', reminder.completed && 'line-through text-muted-foreground')}
            >
              {reminder.text}
            </label>
            <p className={cn('text-sm text-muted-foreground', isPast && 'text-destructive')}>
              {formatDate()}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(reminder)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            {!reminder.completed && (
              <DropdownMenuItem onClick={() => onSnooze(reminder.id)}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Snooze 5 min</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onDelete(reminder.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
