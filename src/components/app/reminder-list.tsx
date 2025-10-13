"use client";

import { Reminder, Category } from '@/lib/types';
import { ReminderCard } from './reminder-card';
import { isPast, isToday, isFuture } from 'date-fns';
import { BellOff } from 'lucide-react';

interface ReminderListProps {
  reminders: Reminder[];
  category: Category | 'All';
  onDelete: (id: string) => void;
  onSnooze: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
}

export function ReminderList({ reminders, category, ...handlers }: ReminderListProps) {
  const filteredReminders =
    category === 'All' ? reminders : reminders.filter((r) => r.category === category);

  const completed = filteredReminders.filter((r) => r.completed).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  const incomplete = filteredReminders.filter((r) => !r.completed);

  const today = incomplete.filter((r) => isToday(new Date(r.dateTime))).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  const upcoming = incomplete.filter((r) => isFuture(new Date(r.dateTime)) && !isToday(new Date(r.dateTime))).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  const past = incomplete.filter((r) => isPast(new Date(r.dateTime)) && !isToday(new Date(r.dateTime))).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  
  const reminderGroups = [
    { title: 'Past', reminders: past },
    { title: 'Today', reminders: today },
    { title: 'Upcoming', reminders: upcoming },
    { title: 'Completed', reminders: completed },
  ].filter(group => group.reminders.length > 0);

  if (filteredReminders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4">
        <BellOff className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold">No reminders here</h3>
        <p className="text-muted-foreground">
          {category === 'All'
            ? 'Add a reminder to get started!'
            : `You have no reminders in the "${category}" category.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reminderGroups.map((group) => (
        <section key={group.title}>
          <h2 className="text-lg font-semibold text-muted-foreground px-1 pb-2">{group.title}</h2>
          <div className="space-y-2">
            {group.reminders.map((reminder) => (
               <div key={reminder.id} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out">
                <ReminderCard reminder={reminder} {...handlers} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
