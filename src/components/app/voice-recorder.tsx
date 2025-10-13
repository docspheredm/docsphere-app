"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addReminderFromVoiceAction } from '@/app/actions';
import { VoiceConfirmationDialog } from './voice-confirmation-dialog';
import type { Reminder } from '@/lib/types';
import { voiceToTextReminder, VoiceToTextReminderOutput } from '@/ai/flows/voice-to-text-reminder';

interface VoiceRecorderProps {
  onAddReminder: (reminderData: Omit<Reminder, 'id' | 'completed' | 'notified'>) => void;
}

const SILENCE_TIMEOUT = 5000; // 5 seconds

export function VoiceRecorder({ onAddReminder }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationData, setConfirmationData] = useState<VoiceToTextReminderOutput | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      // The stream is stopped in the onstop event handler to ensure all data is processed.
    }
  }, []);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    silenceTimerRef.current = setTimeout(() => {
      toast({ title: "Silence detected", description: "Stopping recording..."});
      handleStopRecording();
    }, SILENCE_TIMEOUT);
  }, [handleStopRecording, toast]);


  const handleStartRecording = async () => {
    if (typeof window !== 'undefined' && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            resetSilenceTimer(); // Reset timer on new data
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          setIsRecording(false);
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          
          // Stop all media tracks to turn off the recording indicator.
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
          
          if (audioChunksRef.current.length === 0) {
            console.log("No audio recorded.");
            return;
          };

          setIsLoading(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            try {
                const result = await voiceToTextReminder({ voiceDataUri: base64Audio });
                if (!result.reminderText) {
                    throw new Error('Could not understand the reminder from voice input.');
                }
                setConfirmationData(result);
                setIsConfirming(true);

            } catch (error) {
              console.error('Error processing voice reminder:', error);
              toast({
                title: 'Error',
                description: 'Could not process your voice command. Please try again.',
                variant: 'destructive',
              });
            } finally {
              setIsLoading(false);
            }
          };
        };

        mediaRecorderRef.current.start(1000); // Trigger dataavailable every second
        setIsRecording(true);
        resetSilenceTimer(); // Start the initial timer
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
          title: 'Microphone access denied',
          description: 'Please allow microphone access in your browser settings to use this feature.',
          variant: 'destructive',
        });
      }
    }
  };


  const handleConfirm = async (text: string, dateTime: string | null) => {
    setIsLoading(true);
    try {
        const reminderData = await addReminderFromVoiceAction({
            reminderText: text,
            reminderDateTime: dateTime || undefined,
            category: confirmationData?.category
        });
        onAddReminder(reminderData);
        toast({ title: "Reminder Added!", description: `"${text}" was added.` });

    } catch(e) {
        console.error(e);
        toast({ title: "Error", description: `Could not add reminder. ${e instanceof Error ? e.message : ''}`, variant: "destructive"})
    }
    setIsConfirming(false);
    setConfirmationData(null);
    setIsLoading(false);
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={isLoading}
        size="icon"
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-14 h-14 shadow-lg data-[state=recording]:bg-accent data-[state=recording]:text-accent-foreground"
        data-state={isRecording ? 'recording' : 'idle'}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isLoading ? (
          <LoaderCircle className="animate-spin" />
        ) : isRecording ? (
          <Square className="w-6 h-6 fill-current animate-pulse" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </Button>
      {confirmationData && (
        <VoiceConfirmationDialog 
            open={isConfirming}
            onOpenChange={setIsConfirming}
            initialText={confirmationData.reminderText}
            initialDateTime={confirmationData.reminderDateTime}
            onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
