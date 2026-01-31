/**
 * Encounter Recording Component
 * Step-by-step medical encounter recording UI
 * Supports: greeting, complaints, history, exam, diagnosis, plan, investigations, physio, followup
 * Includes follow-up visit tracking and classification
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EncounterSection, Encounter, Patient, FollowupVisit } from '@/lib/types';
import { Mic, Square, Play, Pause, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EncounterRecorderProps {
  patient: Patient;
  doctorName: string;
  previousEncounters?: Encounter[];
  onSave: (encounter: Encounter, followupVisit?: FollowupVisit) => void;
}

export function EncounterRecorder({ patient, doctorName, previousEncounters, onSave }: EncounterRecorderProps) {
  const [currentStep, setCurrentStep] = useState<
    'greeting' | 'complaints' | 'history' | 'examination' | 'diagnosis' | 'treatment-plan' | 'investigations' | 'physiotherapy' | 'followup'
  >('greeting');

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [speaker, setSpeaker] = useState<'doctor' | 'patient'>('doctor');
  
  // Follow-up Visit Tracking
  const [isFollowupVisit, setIsFollowupVisit] = useState(previousEncounters && previousEncounters.length > 0);
  const [followupType, setFollowupType] = useState<'same-condition' | 'additional-new-condition' | 'entirely-new-condition'>('same-condition');
  const [newConditionDescription, setNewConditionDescription] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const steps = [
    { id: 'greeting', label: 'Greeting', icon: '👋' },
    { id: 'complaints', label: 'Complaints', icon: '😣' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'examination', label: 'Examination', icon: '🔍' },
    { id: 'diagnosis', label: 'Diagnosis', icon: '🩺' },
    { id: 'treatment-plan', label: 'Treatment Plan', icon: '💊' },
    { id: 'investigations', label: 'Investigations', icon: '🧬' },
    { id: 'physiotherapy', label: 'Physiotherapy', icon: '🏃' },
    { id: 'followup', label: 'Follow-up', icon: '📅' },
  ] as const;

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // TODO: Send to transcription API (Whisper)
        // const transcribedText = await transcribeAudio(audioBlob);
        // setTranscript(transcribedText);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSection = () => {
    if (!transcript.trim()) {
      alert('Please add notes or record audio for this section.');
      return;
    }
    // Move to next step or save
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
      setTranscript('');
      setSpeaker('doctor');
    }
  };

  const handleCompleteEncounter = () => {
    if (!transcript.trim()) {
      alert('Please add notes or record audio for the follow-up section.');
      return;
    }

    // Build encounter object
    const encounter: Encounter = {
      id: `enc-${Date.now()}`,
      patientId: patient.id,
      doctorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dateOfEncounter: new Date().toISOString(),
      followupNotes: transcript,
      status: 'completed',
    };

    // Create follow-up visit record if this is a follow-up
    let followupVisit: FollowupVisit | undefined;
    if (isFollowupVisit && previousEncounters && previousEncounters.length > 0) {
      const followupNumber = 1; // Simplified - in production would count actual follow-ups
      const tagMap: Record<typeof followupType, { type: 'same-condition' | 'additional-new' | 'entirely-new', label: string }> = {
        'same-condition': { type: 'same-condition', label: '🔄 Same Condition Follow-up' },
        'additional-new-condition': { type: 'additional-new', label: '➕ Additional New Condition' },
        'entirely-new-condition': { type: 'entirely-new', label: '🆕 Entirely New Condition' },
      };

      followupVisit = {
        id: `followup-${Date.now()}`,
        patientId: patient.id,
        originalEncounterId: previousEncounters[0].id, // Link to first/most recent encounter
        dateOfVisit: new Date().toISOString(),
        doctorName,
        followupType,
        newConditionDescription: newConditionDescription || undefined,
        followupNumber,
        status: 'ongoing',
        patientComplaints: transcript,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [tagMap[followupType]],
      };
    }

    onSave(encounter, followupVisit);
  };

  return (
    <div className="w-full space-y-6">
      {/* Patient Header */}
      <Card>
        <CardHeader>
          <CardTitle>
            {patient.firstName} {patient.lastName} | Age: {patient.age} | Phone: {patient.phoneNumber}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Doctor: {doctorName} | Date: {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
      </Card>

      {/* Progress Steps */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-9">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`p-2 rounded-lg text-xs font-semibold transition ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="text-lg">{step.icon}</div>
              <div className="truncate">{step.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recording Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {steps.find((s) => s.id === currentStep)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Speaker Selection */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="speaker"
                value="doctor"
                checked={speaker === 'doctor'}
                onChange={() => setSpeaker('doctor')}
              />
              <span>Doctor Speaking</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="speaker"
                value="patient"
                checked={speaker === 'patient'}
                onChange={() => setSpeaker('patient')}
              />
              <span>Patient Speaking</span>
            </label>
          </div>

          {/* Recording Controls */}
          <div className="flex gap-4 items-center">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="flex gap-2 bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopRecording}
                  className="flex gap-2 bg-gray-600 hover:bg-gray-700"
                  size="lg"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </Button>
                <Button
                  onClick={togglePause}
                  variant="outline"
                  size="lg"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  )}
                </Button>
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  {formatTime(recordingTime)}
                </Badge>
              </>
            )}
          </div>

          {/* Transcript Area */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Transcript / Notes</label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Transcription will appear here or manually type notes..."
              rows={8}
              className="w-full"
            />
          </div>

          {/* Follow-up Visit Classification (only in follow-up step) */}
          {currentStep === 'followup' && isFollowupVisit && previousEncounters && previousEncounters.length > 0 && (
            <div className="border rounded-lg p-4 bg-blue-50 space-y-4">
              <Alert className="bg-blue-100 border-blue-300">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  ✓ This is a follow-up visit for {patient.firstName} {patient.lastName} with {previousEncounters.length} previous encounter(s).
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  What type of follow-up is this?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 border rounded-lg hover:bg-blue-100">
                    <input
                      type="radio"
                      name="followupType"
                      value="same-condition"
                      checked={followupType === 'same-condition'}
                      onChange={() => setFollowupType('same-condition')}
                    />
                    <span>
                      <strong>Same Condition Follow-up</strong>
                      <p className="text-xs text-gray-600">Continuing treatment for the same condition from previous visit</p>
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2 border rounded-lg hover:bg-blue-100">
                    <input
                      type="radio"
                      name="followupType"
                      value="additional-new-condition"
                      checked={followupType === 'additional-new-condition'}
                      onChange={() => setFollowupType('additional-new-condition')}
                    />
                    <span>
                      <strong>Additional New Condition</strong>
                      <p className="text-xs text-gray-600">New condition in addition to the previous condition</p>
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2 border rounded-lg hover:bg-blue-100">
                    <input
                      type="radio"
                      name="followupType"
                      value="entirely-new-condition"
                      checked={followupType === 'entirely-new-condition'}
                      onChange={() => setFollowupType('entirely-new-condition')}
                    />
                    <span>
                      <strong>Entirely New Condition</strong>
                      <p className="text-xs text-gray-600">Unrelated new condition, not connected to previous visit</p>
                    </span>
                  </label>
                </div>

                {followupType !== 'same-condition' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Brief description of new condition
                    </label>
                    <Input
                      value={newConditionDescription}
                      onChange={(e) => setNewConditionDescription(e.target.value)}
                      placeholder="e.g., Patient now complains of chest pain"
                    />
                  </div>
                )}

                {previousEncounters.length > 0 && (
                  <div className="text-xs text-gray-600 p-2 bg-white rounded border">
                    <strong>Previous Encounters:</strong>
                    <ul className="mt-1 ml-4 list-disc">
                      {previousEncounters.slice(0, 3).map((enc) => (
                        <li key={enc.id}>
                          {new Date(enc.createdAt).toLocaleDateString()} - Dr. {enc.doctorName}
                        </li>
                      ))}
                      {previousEncounters.length > 3 && <li>... and {previousEncounters.length - 3} more</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save & Next */}
          <div className="flex gap-4">
            <Button
              onClick={handleSaveSection}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Save & Continue
            </Button>
            {currentStep === 'followup' && (
              <Button
                onClick={handleCompleteEncounter}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Complete Encounter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
