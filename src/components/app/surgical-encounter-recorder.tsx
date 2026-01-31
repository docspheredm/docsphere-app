/**
 * Surgical Encounter Recorder Component
 * Complete surgical workflow: pre-surgical → surgery → post-surgical
 * Includes: investigations, anesthetic checkup, surgery plan, surgical notes, post-op follow-up
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  SurgicalPatient,
  SurgicalEncounter,
  PreSurgicalInvestigation,
  PreAestheticCheckup,
  SurgeryPlan,
  SurgicalNotes,
  PostSurgeryFollowup,
} from '@/lib/types';
import { Calendar, Clock, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';

interface SurgicalEncounterRecorderProps {
  patient: SurgicalPatient;
  doctorName: string;
  onSave: (encounter: SurgicalEncounter) => void;
}

type SurgicalStage = 'presurgical-investigations' | 'anesthetic-checkup' | 'surgery-plan' | 'surgical-notes' | 'postsurgery-followup';

export function SurgicalEncounterRecorder({
  patient,
  doctorName,
  onSave,
}: SurgicalEncounterRecorderProps) {
  const [currentStage, setCurrentStage] = useState<SurgicalStage>('presurgical-investigations');
  const [surgeryCompleted, setSurgeryCompleted] = useState(false);

  // Pre-Surgical Investigations
  const [preSurgicalInvestigations, setPreSurgicalInvestigations] = useState<PreSurgicalInvestigation[]>([]);
  const [newInvestigation, setNewInvestigation] = useState({
    investigationType: 'blood-test' as const,
    testName: '',
    status: 'ordered' as const,
  });

  // Pre-Anesthetic Checkup
  const [preAestheticCheckup, setPreAestheticCheckup] = useState<Partial<PreAestheticCheckup>>({
    anesthelogistName: '',
    asa_grade: 'II',
    clearanceForSurgery: false,
  });

  // Surgery Plan
  const [surgeryPlan, setSurgeryPlan] = useState<Partial<SurgeryPlan>>({
    surgeryName: '',
    plannedDate: new Date().toISOString().split('T')[0],
    plannedTime: '09:00',
    surgeon: doctorName,
    urgencyLevel: 'elective',
  });

  // Surgical Notes
  const [surgicalNotes, setSurgicalNotes] = useState<Partial<SurgicalNotes>>({
    surgeon: doctorName,
    anesthesiaTechnique: '',
    approach: '',
    findings: '',
    proceduresPerformed: [],
    bloodLoss: '0 ml',
  });

  // Post-Surgery Follow-up
  const [postSurgeryFollowup, setPostSurgeryFollowup] = useState<Partial<PostSurgeryFollowup>>({
    plannedDate: new Date().toISOString().split('T')[0],
    visitNumber: 1,
    woundStatus: '',
    status: 'scheduled',
  });

  const stages = [
    { id: 'presurgical-investigations', label: 'Pre-Surgical', icon: '🩸', description: 'Investigations & Tests' },
    { id: 'anesthetic-checkup', label: 'Anesthetic', icon: '🏥', description: 'Checkup & Clearance' },
    { id: 'surgery-plan', label: 'Surgery Plan', icon: '📅', description: 'Date & Details' },
    { id: 'surgical-notes', label: 'Surgical Notes', icon: '📝', description: 'Intra-operative Record' },
    { id: 'postsurgery-followup', label: 'Post-Op Follow-up', icon: '✅', description: 'Recovery Progress' },
  ] as const;

  const handleAddInvestigation = () => {
    if (!newInvestigation.testName) {
      alert('Please enter test name');
      return;
    }
    setPreSurgicalInvestigations([
      ...preSurgicalInvestigations,
      {
        id: `inv-${Date.now()}`,
        surgicalEncounterId: '',
        investigationType: newInvestigation.investigationType,
        testName: newInvestigation.testName,
        orderedDate: new Date().toISOString(),
        status: newInvestigation.status,
      },
    ]);
    setNewInvestigation({ investigationType: 'blood-test', testName: '', status: 'ordered' });
  };

  const handleCompleteSurgery = () => {
    if (!surgicalNotes.anesthesiaTechnique || !surgicalNotes.approach || !surgicalNotes.findings) {
      alert('Please fill in anesthesia technique, approach, and findings');
      return;
    }
    setSurgeryCompleted(true);
    // Auto-advance to post-op follow-up
    setCurrentStage('postsurgery-followup');
  };

  const handleSaveEncounter = () => {
    const encounter: SurgicalEncounter = {
      id: `surg-enc-${Date.now()}`,
      patientId: patient.id,
      doctorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: surgeryCompleted ? 'completed' : 'pre-surgical',
      surgeryCompleted,
      surgeryCompletedDate: surgeryCompleted ? new Date().toISOString() : undefined,
      preSurgicalInvestigations,
      preAestheticCheckup: preAestheticCheckup as PreAestheticCheckup,
      surgeryPlan: surgeryPlan as SurgeryPlan,
      surgicalNotes: surgeryCompleted ? (surgicalNotes as SurgicalNotes) : undefined,
      postSurgeryFollowups: surgeryCompleted ? [postSurgeryFollowup as PostSurgeryFollowup] : undefined,
    };
    onSave(encounter);
    alert('Surgical encounter saved successfully!');
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
            Surgical Patient | Dr. {doctorName} | Date: {new Date().toLocaleDateString()}
          </p>
          {patient.originalOPDEncounterId && (
            <Badge variant="outline" className="mt-2">
              Transitioned from OPD
            </Badge>
          )}
        </CardHeader>
      </Card>

      {/* Stage Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setCurrentStage(stage.id)}
                className={`p-3 rounded-lg text-xs font-semibold text-center transition ${
                  currentStage === stage.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <div className="text-lg mb-1">{stage.icon}</div>
                <div>{stage.label}</div>
                <div className="text-xs opacity-75">{stage.description}</div>
              </button>
            ))}
          </div>

          {/* Surgery Status */}
          {surgeryCompleted && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Surgery completed. Now documenting post-operative follow-up.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Stage Content */}
      <Tabs value={currentStage} onValueChange={(v) => setCurrentStage(v as SurgicalStage)}>
        {/* STAGE 1: PRE-SURGICAL INVESTIGATIONS */}
        <TabsContent value="presurgical-investigations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Surgical Investigations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Order required investigations. Patient must be cleared before anesthetic checkup.
                </AlertDescription>
              </Alert>

              {/* Add Investigation */}
              <div className="space-y-3 border-b pb-4">
                <label className="block text-sm font-medium">Add Investigation</label>
                <select
                  value={newInvestigation.investigationType}
                  onChange={(e) =>
                    setNewInvestigation({ ...newInvestigation, investigationType: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="blood-test">Blood Test</option>
                  <option value="imaging">Imaging (CT/MRI)</option>
                  <option value="ecg">ECG</option>
                  <option value="echo">Echocardiography</option>
                  <option value="pts-inr">PT/INR</option>
                  <option value="chest-xray">Chest X-Ray</option>
                  <option value="other">Other</option>
                </select>
                <Input
                  placeholder="Test name (e.g., Complete Blood Count)"
                  value={newInvestigation.testName}
                  onChange={(e) => setNewInvestigation({ ...newInvestigation, testName: e.target.value })}
                />
                <Button onClick={handleAddInvestigation} className="bg-blue-600 hover:bg-blue-700">
                  Add Investigation
                </Button>
              </div>

              {/* Investigations List */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Investigations Ordered</label>
                {preSurgicalInvestigations.length === 0 ? (
                  <p className="text-gray-500">No investigations added yet.</p>
                ) : (
                  preSurgicalInvestigations.map((inv) => (
                    <Card key={inv.id} className="p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{inv.testName}</p>
                          <p className="text-sm text-gray-600">{inv.investigationType}</p>
                        </div>
                        <Badge variant={inv.status === 'completed' ? 'default' : 'secondary'}>
                          {inv.status}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <Button
                onClick={() => setCurrentStage('anesthetic-checkup')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue to Anesthetic Checkup →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STAGE 2: PRE-ANESTHETIC CHECKUP */}
        <TabsContent value="anesthetic-checkup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Anesthetic Checkup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-orange-50 border-orange-200">
                <Stethoscope className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Anesthesiologist assessment and clearance for surgery.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Anesthesiologist Name</label>
                  <Input
                    value={preAestheticCheckup.anesthelogistName || ''}
                    onChange={(e) =>
                      setPreAestheticCheckup({ ...preAestheticCheckup, anesthelogistName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">ASA Grade</label>
                  <select
                    value={preAestheticCheckup.asa_grade || 'II'}
                    onChange={(e) =>
                      setPreAestheticCheckup({ ...preAestheticCheckup, asa_grade: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="I">I - Normal healthy patient</option>
                    <option value="II">II - Mild systemic disease</option>
                    <option value="III">III - Severe systemic disease</option>
                    <option value="IV">IV - Life-threatening disease</option>
                    <option value="V">V - Moribund patient</option>
                    <option value="E">E - Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Medical Optimization</label>
                <Textarea
                  value={preAestheticCheckup.medicalOptimization || ''}
                  onChange={(e) =>
                    setPreAestheticCheckup({ ...preAestheticCheckup, medicalOptimization: e.target.value })
                  }
                  placeholder="Any medications, optimizations needed"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Airway Assessment</label>
                <Textarea
                  value={preAestheticCheckup.airwayAssessment || ''}
                  onChange={(e) =>
                    setPreAestheticCheckup({ ...preAestheticCheckup, airwayAssessment: e.target.value })
                  }
                  placeholder="Mallampati score, jaw mobility, dentition, etc."
                  rows={3}
                />
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preAestheticCheckup.clearanceForSurgery || false}
                    onChange={(e) =>
                      setPreAestheticCheckup({ ...preAestheticCheckup, clearanceForSurgery: e.target.checked })
                    }
                  />
                  <span className="font-medium">Cleared for Surgery</span>
                </label>
              </div>

              <Button
                onClick={() => setCurrentStage('surgery-plan')}
                disabled={!preAestheticCheckup.clearanceForSurgery}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue to Surgery Plan →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STAGE 3: SURGERY PLAN */}
        <TabsContent value="surgery-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Surgery Plan & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Surgery Name *</label>
                  <Input
                    value={surgeryPlan.surgeryName || ''}
                    onChange={(e) => setSurgeryPlan({ ...surgeryPlan, surgeryName: e.target.value })}
                    placeholder="e.g., Appendectomy, Cholecystectomy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Urgency Level</label>
                  <select
                    value={surgeryPlan.urgencyLevel || 'elective'}
                    onChange={(e) =>
                      setSurgeryPlan({ ...surgeryPlan, urgencyLevel: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="elective">Elective</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Planned Date</label>
                  <Input
                    type="date"
                    value={surgeryPlan.plannedDate || ''}
                    onChange={(e) => setSurgeryPlan({ ...surgeryPlan, plannedDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Planned Time</label>
                  <Input
                    type="time"
                    value={surgeryPlan.plannedTime || ''}
                    onChange={(e) => setSurgeryPlan({ ...surgeryPlan, plannedTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Anesthetic Technique</label>
                <Textarea
                  value={surgeryPlan.anestheticTechnique || ''}
                  onChange={(e) => setSurgeryPlan({ ...surgeryPlan, anestheticTechnique: e.target.value })}
                  placeholder="e.g., General anesthesia with regional block"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Surgery Notes & Details</label>
                <Textarea
                  value={surgeryPlan.notes || ''}
                  onChange={(e) => setSurgeryPlan({ ...surgeryPlan, notes: e.target.value })}
                  placeholder="Any special considerations, patient positioning, implants expected, etc."
                  rows={4}
                />
              </div>

              <Button
                onClick={() => setCurrentStage('surgical-notes')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue to Surgery →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STAGE 4: SURGICAL NOTES (INTRA-OPERATIVE) */}
        <TabsContent value="surgical-notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Surgical Notes - Intra-operative Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-purple-50 border-purple-200">
                <AlertCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  Complete documentation of surgical procedure. Mark as complete when surgery is done.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Anesthesia Technique *</label>
                  <Input
                    value={surgicalNotes.anesthesiaTechnique || ''}
                    onChange={(e) =>
                      setSurgicalNotes({ ...surgicalNotes, anesthesiaTechnique: e.target.value })
                    }
                    placeholder="e.g., General with epidural"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Blood Loss</label>
                  <Input
                    value={surgicalNotes.bloodLoss || ''}
                    onChange={(e) => setSurgicalNotes({ ...surgicalNotes, bloodLoss: e.target.value })}
                    placeholder="e.g., 250 ml"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Surgical Approach *</label>
                <Textarea
                  value={surgicalNotes.approach || ''}
                  onChange={(e) => setSurgicalNotes({ ...surgicalNotes, approach: e.target.value })}
                  placeholder="e.g., Open laparotomy with right subcostal incision"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Intra-operative Findings *</label>
                <Textarea
                  value={surgicalNotes.findings || ''}
                  onChange={(e) => setSurgicalNotes({ ...surgicalNotes, findings: e.target.value })}
                  placeholder="Describe what was found, pathology, etc."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Complications (if any)</label>
                <Textarea
                  value={surgicalNotes.complications || ''}
                  onChange={(e) => setSurgicalNotes({ ...surgicalNotes, complications: e.target.value })}
                  placeholder="Any intra-operative complications"
                  rows={2}
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2 text-blue-600">Samples & Cultures</label>
                <Textarea
                  placeholder="Biopsy samples sent for histopathology, culture samples for microbiology, etc."
                  rows={2}
                  className="mb-2"
                />
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2 text-green-600">Implants Used</label>
                <Textarea
                  placeholder="List any implants, prosthesis, stents, plates with serial/batch numbers"
                  rows={2}
                  className="mb-2"
                />
              </div>

              <Button
                onClick={handleCompleteSurgery}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                ✓ Mark Surgery as Completed
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STAGE 5: POST-SURGERY FOLLOW-UP */}
        <TabsContent value="postsurgery-followup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post-Surgery Follow-up & Recovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!surgeryCompleted && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Complete the surgical notes first before documenting post-operative follow-up.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Visit Number</label>
                  <Input
                    type="number"
                    value={postSurgeryFollowup.visitNumber || 1}
                    onChange={(e) =>
                      setPostSurgeryFollowup({
                        ...postSurgeryFollowup,
                        visitNumber: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Planned Follow-up Date</label>
                  <Input
                    type="date"
                    value={postSurgeryFollowup.plannedDate || ''}
                    onChange={(e) =>
                      setPostSurgeryFollowup({ ...postSurgeryFollowup, plannedDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Wound Status</label>
                <Textarea
                  value={postSurgeryFollowup.woundStatus || ''}
                  onChange={(e) =>
                    setPostSurgeryFollowup({ ...postSurgeryFollowup, woundStatus: e.target.value })
                  }
                  placeholder="Describe wound healing: clean, erythema, discharge, seroma, etc."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postSurgeryFollowup.suturRemovalDone || false}
                      onChange={(e) =>
                        setPostSurgeryFollowup({
                          ...postSurgeryFollowup,
                          suturRemovalDone: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-medium">Sutures Removed</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postSurgeryFollowup.drainRemovalDone || false}
                      onChange={(e) =>
                        setPostSurgeryFollowup({
                          ...postSurgeryFollowup,
                          drainRemovalDone: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-medium">Drain Removed</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Physical Examination</label>
                <Textarea
                  value={postSurgeryFollowup.physicalExamination || ''}
                  onChange={(e) =>
                    setPostSurgeryFollowup({
                      ...postSurgeryFollowup,
                      physicalExamination: e.target.value,
                    })
                  }
                  placeholder="General condition, vitals, pain level, mobility, etc."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Further Management Plan</label>
                <Textarea
                  value={postSurgeryFollowup.furtherTreatment || ''}
                  onChange={(e) =>
                    setPostSurgeryFollowup({ ...postSurgeryFollowup, furtherTreatment: e.target.value })
                  }
                  placeholder="Next steps, medications, therapy, next follow-up date"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSaveEncounter}
                className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
              >
                ✓ Complete & Save Surgical Encounter
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
