    "use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import type { Reminder, Category } from '@/lib/types';
import { AppSidebar } from '@/components/app/app-sidebar';
import { AppHeader } from '@/components/app/app-header';
import { ReminderList } from '@/components/app/reminder-list';
import { AddReminderDialog } from '@/components/app/add-reminder-dialog';
import { add, format, subDays } from 'date-fns';
import * as Tone from 'tone';

const getInitialReminders = (): Reminder[] => {
    const now = new Date();
    return [
        {
            id: '1',
            text: 'Call Dr. Smith about test results',
            dateTime: add(now, { minutes: 5 }).toISOString(),
            category: 'Patients',
            completed: false,
            notified: false,
        },
        {
            id: '2',
            text: 'Buy milk, eggs, and bread',
            dateTime: add(now, { hours: 2 }).toISOString(),
            category: 'Grocery',
            completed: false,
            notified: false,
        },
        {
            id: '3',
            text: 'Read chapter 5 of "The Great Gatsby"',
            dateTime: add(now, { days: 1 }).toISOString(),
            category: 'Reading',
            completed: true,
            notified: true,
        },
        {
            id: '4',
            text: 'Book flight to New York',
            dateTime: add(now, { days: 3 }).toISOString(),
            category: 'Travel',
            completed: false,
            notified: false,
        },
        {
            id: '5',
            text: 'Pay credit card bill',
            dateTime: subDays(now, 2).toISOString(),
            category: 'Finance',
            completed: false,
            notified: true,
        },
    ];
};

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const toneJsStarted = useRef(false);

  useEffect(() => {
    // This effect runs once on mount to confirm we are on the client.
    setIsClient(true);
  }, []);

  useEffect(() => {
    // This effect runs only when isClient becomes true.
    if (isClient) {
      // Load reminders from local storage on mount
      let initialReminders: Reminder[];
      try {
        const storedReminders = localStorage.getItem('vocalist-reminders');
        initialReminders = storedReminders ? JSON.parse(storedReminders) : getInitialReminders();
      } catch (error) {
        console.error("Failed to load reminders from localStorage", error);
        initialReminders = getInitialReminders();
      }
      setReminders(initialReminders);

      // Add a click listener to start the audio context.
      const startTone = async () => {
        if (toneJsStarted.current) return;
        try {
          await Tone.start();
          toneJsStarted.current = true;
          console.log('AudioContext started');
        } catch (e) {
          console.error("Failed to start Tone.js AudioContext", e);
        }
      };
      
      window.addEventListener('click', startTone);

      return () => {
        window.removeEventListener('click', startTone);
      }
    }
  }, [isClient]);

  useEffect(() => {
    // This effect runs whenever reminders change, but only on the client.
    if (isClient) {
      try {
        localStorage.setItem('vocalist-reminders', JSON.stringify(reminders));
      } catch (error) {
        console.error("Failed to save reminders to localStorage", error);
      }
    }
  }, [reminders, isClient]);

  const handleSnooze = useCallback((id: string) => {
    setReminders(prev =>
      prev.map(r =>
        r.id === id ? { ...r, dateTime: add(new Date(), { minutes: 5 }).toISOString(), notified: false } : r
      )
    );
    toast({ title: 'Snoozed!', description: 'Reminder snoozed for 5 minutes.' });
  }, [toast]);

  useEffect(() => {
    // This effect handles the notification interval, only on the client.
    if (!isClient) return;
    
    const intervalId = setInterval(() => {
      const now = Date.now();
      let shouldUpdateState = false;

      setReminders(currentReminders => {
        const newReminders = currentReminders.map(r => {
            if (!r.completed && !r.notified && new Date(r.dateTime).getTime() <= now) {
              shouldUpdateState = true;
              toast({
                  title: "Reminder: " + r.text,
                  description: `Scheduled for ${format(new Date(r.dateTime), 'p, MMM d')}`,
                  duration: 10000,
                  action: <ToastAction altText="Snooze" onClick={() => handleSnooze(r.id)}>Snooze</ToastAction>,
              });

              if (toneJsStarted.current) {
                  try {
                    const synth = new Tone.Synth().toDestination();
                    synth.triggerAttackRelease("C5", "8n", Tone.now());
                  } catch (e) {
                    console.error("Tone.js error:", e);
                  }
              }
            
              return { ...r, notified: true };
            }
            return r;
        });

        return shouldUpdateState ? newReminders : currentReminders;
      });

    }, 5000); // check every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [isClient, toast, handleSnooze]);


  const handleAddReminder = useCallback((data: Omit<Reminder, 'id' | 'completed' | 'notified'>) => {
    const newReminder: Reminder = {
      ...data,
      id: Date.now().toString(),
      completed: false,
      notified: false,
    };
    setReminders(prev => [newReminder, ...prev]);
    toast({ title: 'Reminder Added', description: `"${data.text}"` });
  }, [toast]);

  const handleDeleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleToggleComplete = useCallback((id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  }, []);

  const handleEditReminder = useCallback((reminder: Reminder) => {
    setEditingReminder(reminder);
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateReminder = useCallback((id: string, data: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...data, notified: false } : r));
    setEditingReminder(undefined);
    setIsEditDialogOpen(false);
    toast({ title: "Reminder Updated" });
  }, [toast]);

  if (!isClient) {
    // Return a loader or null to avoid server-side rendering mismatches
    // and hydration errors during deployment.
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
        <SidebarInset className="flex flex-col">
          <AppHeader onAddReminder={handleAddReminder} />
          <main className="flex-1 p-4 overflow-y-auto">
            <ReminderList
              reminders={reminders}
              category={activeCategory}
              onDelete={handleDeleteReminder}
              onSnooze={handleSnooze}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditReminder}
            />
          </main>
        </SidebarInset>
      </div>
      {editingReminder && (
        <AddReminderDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          reminder={editingReminder}
          onUpdateReminder={handleUpdateReminder}
          onAddReminder={() => {}} // Not used in edit mode
        >
          {/* This is a controlled dialog, trigger is managed by state */}
          <div />
        </AddReminderDialog>
      )}
    </SidebarProvider>
  );
}
