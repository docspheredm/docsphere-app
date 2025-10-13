"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, LoaderCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { addReminderAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Reminder } from '@/lib/types';

const formSchema = z.object({
  text: z.string().min(3, 'Reminder must be at least 3 characters long.'),
  date: z.date().optional(),
  time: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddReminderDialogProps {
  onAddReminder: (data: Omit<Reminder, 'id' | 'completed' | 'notified'>) => void;
  onUpdateReminder?: (id: string, data: Partial<Reminder>) => void;
  reminder?: Reminder;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddReminderDialog({ onAddReminder, onUpdateReminder, reminder, children, open, onOpenChange }: AddReminderDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!reminder;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      const defaultTime = reminder ? format(new Date(reminder.dateTime), 'HH:mm') : undefined;
      const defaultDate = reminder ? new Date(reminder.dateTime) : undefined;
      form.reset({
        text: reminder?.text || '',
        date: defaultDate,
        time: defaultTime,
      });
    }
  }, [open, reminder, form]);


  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    let reminderDateTime: string | null = null;
    if (values.date) {
      const newDate = new Date(values.date);
      if (values.time) {
        const [hours, minutes] = values.time.split(':');
        newDate.setHours(Number(hours), Number(minutes));
      }
      reminderDateTime = newDate.toISOString();
    }
    
    try {
      if (isEditMode && onUpdateReminder && reminder) {
        onUpdateReminder(reminder.id, {
            text: values.text,
            dateTime: reminderDateTime || reminder.dateTime
        })
      } else {
        const reminderData = await addReminderAction(values.text, reminderDateTime);
        onAddReminder(reminderData);
      }
      if (onOpenChange) onOpenChange(false);
      form.reset({ text: '', date: undefined, time: undefined });
    } catch (error) {
      console.error('Error saving reminder:', error);
      toast({
        title: 'Error',
        description: `Could not save reminder. ${error instanceof Error ? error.message : ''}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Reminder' : 'Add a new Reminder'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of your reminder.' : 'Type your reminder and set a date and time.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Call mom tomorrow at 5pm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <>{isEditMode ? 'Save Changes' : 'Add Reminder'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
