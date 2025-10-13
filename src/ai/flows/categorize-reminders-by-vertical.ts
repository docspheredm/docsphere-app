'use server';
/**
 * @fileOverview Categorizes reminders into predefined verticals.
 *
 * - categorizeReminder - A function that categorizes a reminder into one of the predefined verticals.
 * - CategorizeReminderInput - The input type for the categorizeReminder function.
 * - CategorizeReminderOutput - The return type for the categorizeReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeReminderInputSchema = z.object({
  reminderText: z.string().describe('The text content of the reminder.'),
});
export type CategorizeReminderInput = z.infer<typeof CategorizeReminderInputSchema>;

const CategorizeReminderOutputSchema = z.object({
  category: z
    .enum(['Patients', 'Grocery', 'Reading', 'Travel', 'Finance', 'General'])
    .describe('The category the reminder belongs to.'),
});
export type CategorizeReminderOutput = z.infer<typeof CategorizeReminderOutputSchema>;

export async function categorizeReminder(input: CategorizeReminderInput): Promise<CategorizeReminderOutput> {
  return categorizeReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeReminderPrompt',
  input: {schema: CategorizeReminderInputSchema},
  output: {schema: CategorizeReminderOutputSchema},
  prompt: `You are a reminder categorization expert. Your job is to categorize the reminder text into one of the following verticals: Patients, Grocery, Reading, Travel, Finance, General.

Reminder Text: {{{reminderText}}}

Category:`,
});

const categorizeReminderFlow = ai.defineFlow(
  {
    name: 'categorizeReminderFlow',
    inputSchema: CategorizeReminderInputSchema,
    outputSchema: CategorizeReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
