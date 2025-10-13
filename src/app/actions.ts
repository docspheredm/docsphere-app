'use server';

import { categorizeReminder } from '@/ai/flows/categorize-reminders-by-vertical';
import { VoiceToTextReminderOutput } from '@/ai/flows/voice-to-text-reminder';
import type { Reminder, Category } from '@/lib/types';
import { categories } from '@/lib/types';

const validCategories = categories.map(c => c.name);

export async function addReminderAction(
  text: string,
  dateTime: string | null
): Promise<Omit<Reminder, 'id' | 'completed' | 'notified'>> {
  if (!text) {
    throw new Error('Reminder text cannot be empty.');
  }
  const { category } = await categorizeReminder({ reminderText: text });
  
  return {
    text,
    dateTime: dateTime || new Date().toISOString(),
    category: validCategories.includes(category as Category) ? category as Category : 'General',
  };
}

// This action now handles both the initial voice processing and the confirmed text.
export async function addReminderFromVoiceAction(
  input: Partial<VoiceToTextReminderOutput>
): Promise<Omit<Reminder, 'id' | 'completed' | 'notified'>> {
  const { reminderText, reminderDateTime, category } = input;

  if (!reminderText) {
    throw new Error('Could not understand the reminder from voice input.');
  }

  let finalCategory: Category = 'General';
  if (category && validCategories.includes(category as Category)) {
      finalCategory = category as Category;
  } else {
      // If no category was determined from voice, categorize now from text.
      const categorization = await categorizeReminder({ reminderText });
      if (categorization.category && validCategories.includes(categorization.category as Category)) {
          finalCategory = categorization.category as Category;
      }
  }

  return {
    text: reminderText,
    dateTime: reminderDateTime || new Date().toISOString(),
    category: finalCategory,
  };
}
