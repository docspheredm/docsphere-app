"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VoiceRecorder } from './voice-recorder';
import { AddReminderDialog } from './add-reminder';
import { Reminder } from '@/lib/types';

interface AppHeaderProps {
  onAddReminder: (data: Omit<Reminder, 'id' | 'completed' | 'notified'>) => void;
}

export function AppHeader({ onAddReminder }: AppHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold tracking-tight">Your Reminders</h1>
      <div className="flex items-center gap-4">
        <VoiceRecorder onAddReminder={onAddReminder} />
        <AddReminderDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAddReminder={(data) => {
            onAddReminder(data);
            setIsAddDialogOpen(false);
          }}
        >
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Reminder
          </Button>
        </AddReminderDialog>
      </div>
    </header>
  );
}

