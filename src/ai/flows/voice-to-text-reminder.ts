'use server';

/**
 * @fileOverview Converts voice input to text and extracts reminder details.
 *
 * - voiceToTextReminder - A function that handles the voice-to-text reminder creation process.
 * - VoiceToTextReminderInput - The input type for the voiceToTextReminder function.
 * - VoiceToTextReminderOutput - The return type for the voiceToTextReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceToTextReminderInputSchema = z.object({
  voiceDataUri:
      z.string().describe(
          'The voice data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type VoiceToTextReminderInput = z.infer<typeof VoiceToTextReminderInputSchema>;

const VoiceToTextReminderOutputSchema = z.object({
  reminderText: z.string().describe('The extracted reminder text.'),
  reminderDateTime: z.string().optional().describe('The extracted date and time for the reminder in ISO format, if present.'),
  category: z.string().optional().describe('The category of the reminder, if specified.'),
});
export type VoiceToTextReminderOutput = z.infer<typeof VoiceToTextReminderOutputSchema>;

const prompt = ai.definePrompt({
  name: 'voiceToTextReminderPrompt',
  input: {schema: z.object({
    voiceDataUri: VoiceToTextReminderInputSchema.shape.voiceDataUri,
    currentDateTime: z.string(),
    currentDateOnly: z.string(),
    currentTime: z.string(),
    userTimezone: z.string()
  })},
  output: {schema: VoiceToTextReminderOutputSchema},
  prompt: `You are a reminder assistant that extracts information from voice input.

**CURRENT CONTEXT**:
- Full DateTime: {{{currentDateTime}}}
- Today's Date: {{{currentDateOnly}}}
- Current Time: {{{currentTime}}}
- Timezone: {{{userTimezone}}}

Voice Input: {{media url=voiceDataUri}}

**CRITICAL DATE/TIME EXTRACTION RULES**:

1. **"TODAY" / "TONIGHT" / "THIS EVENING" / "THIS AFTERNOON"**:
   - ALWAYS use the date: {{{currentDateOnly}}}
   - "tonight" = {{{currentDateOnly}}} at 21:00
   - "this evening" = {{{currentDateOnly}}} at 20:00
   - "this afternoon" = {{{currentDateOnly}}} at 15:00

2. **"TOMORROW" / "TOMORROW MORNING" / "TOMORROW NIGHT"**:
   - Add exactly 1 day to {{{currentDateOnly}}}
   - "tomorrow morning" = tomorrow's date at 09:00
   - "tomorrow night" = tomorrow's date at 21:00

3. **SPECIFIC TIMES**:
   - "9 pm" or "9pm" = 21:00
   - "9 am" or "9am" = 09:00
   - "noon" or "12pm" = 12:00
   - "midnight" or "12am" = 00:00

4. **TIME FORMAT**:
   - Output MUST be: YYYY-MM-DDTHH:mm:ss
   - Use 24-hour format
   - NO timezone suffix (Z, +00:00, etc)

**EXAMPLE OUTPUTS** (if today is 2025-10-06):
- "tonight at 9pm" → reminderDateTime: "2025-10-06T21:00:00"
- "today at 3pm" → reminderDateTime: "2025-10-06T15:00:00"
- "tomorrow at 8am" → reminderDateTime: "2025-10-07T08:00:00"

**YOUR TASKS**:
1. Transcribe the exact spoken words into "reminderText"
2. Extract the date/time following the rules above into "reminderDateTime"
3. Categorize into one of: Patients, Grocery, Reading, Travel, Finance, General (or leave empty)

**IMPORTANT**: Double-check your date calculation. "Tonight" MUST be today's date, not tomorrow!`,
});


const voiceToTextReminderFlow = ai.defineFlow(
  {
    name: 'voiceToTextReminderFlow',
    inputSchema: VoiceToTextReminderInputSchema,
    outputSchema: VoiceToTextReminderOutputSchema,
  },
  async (input) => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    
    // Format date components explicitly
    const currentDateTime = now.toISOString();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const currentDateOnly = `${year}-${month}-${day}`;
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    console.log('Processing reminder with:', {
      currentDateTime,
      currentDateOnly,
      currentTime,
      userTimezone
    });
    
    const {output} = await prompt({
      voiceDataUri: input.voiceDataUri,
      currentDateTime,
      currentDateOnly,
      currentTime,
      userTimezone,
    });
    
    if (!output) {
      throw new Error('No output received from AI prompt');
    }
    
    console.log('AI extracted:', output);
    
    // Validate the extracted date
    if (output.reminderDateTime) {
      const extractedDate = new Date(output.reminderDateTime);
      const todayDate = new Date(currentDateOnly);
      
      // Check if "tonight" was incorrectly set to tomorrow
      if (output.reminderText.toLowerCase().includes('tonight') && 
          extractedDate.getUTCDate() !== todayDate.getUTCDate()) {
        console.error('ERROR: "tonight" was set to wrong date!');
        console.error('Expected:', currentDateOnly, 'Got:', output.reminderDateTime);
      }
    }
    
    return output;
  }
);


export async function voiceToTextReminder(
  input: VoiceToTextReminderInput
): Promise<VoiceToTextReminderOutput> {
  try {
    return await voiceToTextReminderFlow(input);
  } catch (error) {
    console.error('Voice to text reminder error:', error);
    throw new Error('Failed to process voice reminder');
  }
}
