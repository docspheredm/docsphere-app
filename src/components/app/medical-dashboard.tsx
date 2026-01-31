/**
 * Main Dashboard Component
 * Tabbed interface for:
 * - New Patient Entry
 * - Old Patient Recovery (History)
 * - Reminders
 * - Search
 */

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Patient, Encounter, MedicalReminder, SurgicalPatient, SurgicalEncounter } from '@/lib/types';
import { EncounterRecorder } from './encounter-recorder';
import { SurgicalEncounterRecorder } from './surgical-encounter-recorder';
import { Calendar, Clock, Plus, Search, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';

interface DashboardProps {
  doctorName: string;
  doctorId?: string;
}

export function MedicalDashboard({ doctorName, doctorId }: DashboardProps) {
  // State Management
  const [patients, setPatients] = useState<Patient[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [reminders, setReminders] = useState<MedicalReminder[]>([]);
  const [surgicalPatients, setSurgicalPatients] = useState<SurgicalPatient[]>([]);
  const [surgicalEncounters, setSurgicalEncounters] = useState<SurgicalEncounter[]>([]);
  const [selectedSurgicalPatient, setSelectedSurgicalPatient] = useState<SurgicalPatient | null>(null);
  const [showSurgicalRecorder, setShowSurgicalRecorder] = useState(false);
  
  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    phoneNumber: '',
    email: '',
    gender: 'M' as 'M' | 'F' | 'Other',
  });

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showEncounterRecorder, setShowEncounterRecorder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ============= NEW PATIENT ENTRY =============
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPatientForm.firstName || !newPatientForm.lastName || !newPatientForm.age || !newPatientForm.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatientForm),
      });

      if (!response.ok) throw new Error('Failed to create patient');

      const data = await response.json();
      const patient = data.data;

      setPatients([...patients, patient]);
      setNewPatientForm({
        firstName: '',
        lastName: '',
        age: '',
        phoneNumber: '',
        email: '',
        gender: 'M',
      });

      // Auto-select the new patient and start recording
      setSelectedPatient(patient);
      setShowEncounterRecorder(true);

      alert(`Patient ${patient.firstName} ${patient.lastName} created! Starting encounter recording...`);
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Error creating patient. Please try again.');
    }
  };

  // ============= SEARCH PATIENTS =============
  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a patient name or phone number');
      return;
    }

    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      // Results would be shown in a modal or results section
      console.log('Search results:', data.data);
    } catch (error) {
      console.error('Error searching patients:', error);
      alert('Error searching patients.');
    }
  };

  // ============= REMINDER MANAGEMENT =============
  const completeReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) throw new Error('Failed to update reminder');

      setReminders(reminders.map((r) => (r.id === reminderId ? { ...r, status: 'completed' } : r)));
    } catch (error) {
      console.error('Error completing reminder:', error);
      alert('Error updating reminder.');
    }
  };

  const deleteReminder = async (reminderId: string) => {
    if (!confirm('Delete this reminder?')) return;

    try {
      const response = await fetch(`/api/reminders/${reminderId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete reminder');

      setReminders(reminders.filter((r) => r.id !== reminderId));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Error deleting reminder.');
    }
  };

  // ============= SURGICAL WORKFLOW =============
  const transitionOPDtoSurgical = async (opdPatient: Patient) => {
    // Convert OPD patient to surgical patient
    const surgicalPatient: SurgicalPatient = {
      ...opdPatient,
      surgicalStatus: 'pre-surgical',
      originalOPDEncounterId: encounters.find(e => e.patientId === opdPatient.id)?.id,
      surgicalEncounters: [],
      transitionedFromOPDDate: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/surgical-patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surgicalPatient),
      });

      if (!response.ok) throw new Error('Failed to transition patient');

      const data = await response.json();
      setSurgicalPatients([...surgicalPatients, data.data]);
      setSelectedSurgicalPatient(data.data);
      setShowSurgicalRecorder(true);

      alert(`${opdPatient.firstName} transitioned to surgical workflow!`);
    } catch (error) {
      console.error('Error transitioning patient:', error);
      alert('Error transitioning patient to surgical workflow.');
    }
  };

  const handleSaveSurgicalEncounter = (encounter: SurgicalEncounter) => {
    setSurgicalEncounters([...surgicalEncounters, encounter]);
    
    // Update surgical patient status
    if (selectedSurgicalPatient) {
      const updated: SurgicalPatient = {
        ...selectedSurgicalPatient,
        surgicalEncounters: [...(selectedSurgicalPatient.surgicalEncounters || []), encounter.id],
        surgicalStatus: encounter.surgeryCompleted ? 'post-surgical' : 'pre-surgical',
      };
      setSurgicalPatients(
        surgicalPatients.map((p) => (p.id === selectedSurgicalPatient.id ? updated : p))
      );
      setSelectedSurgicalPatient(updated);
    }

    setShowSurgicalRecorder(false);
    alert('Surgical encounter saved successfully!');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">MediVoice Records</h1>
          <p className="text-gray-600 text-lg">
            Dr. {doctorName} | Real-time Voice-to-Text Medical Encounter Recording
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="new-patient" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-lg p-1">
            <TabsTrigger value="new-patient" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Patient
            </TabsTrigger>
            <TabsTrigger value="surgical-patients" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4" />
              Surgical
            </TabsTrigger>
            <TabsTrigger value="old-patient" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Old Patient
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Reminders
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: NEW PATIENT ENTRY */}
          <TabsContent value="new-patient" className="mt-6 space-y-6">
            {!showEncounterRecorder ? (
              <Card className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle>New Patient Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddPatient} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input
                          type="text"
                          placeholder="First name"
                          value={newPatientForm.firstName}
                          onChange={(e) =>
                            setNewPatientForm({ ...newPatientForm, firstName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input
                          type="text"
                          placeholder="Last name"
                          value={newPatientForm.lastName}
                          onChange={(e) =>
                            setNewPatientForm({ ...newPatientForm, lastName: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Age *</label>
                        <Input
                          type="number"
                          placeholder="Age"
                          value={newPatientForm.age}
                          onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                        <Input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={newPatientForm.phoneNumber}
                          onChange={(e) =>
                            setNewPatientForm({ ...newPatientForm, phoneNumber: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Gender</label>
                        <select
                          value={newPatientForm.gender}
                          onChange={(e) =>
                            setNewPatientForm({
                              ...newPatientForm,
                              gender: e.target.value as 'M' | 'F' | 'Other',
                            })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email (Optional)</label>
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newPatientForm.email}
                        onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                      Create Patient & Start Encounter Recording
                    </Button>
                  </form>

                  <Alert className="mt-6 bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      The doctor will speak the patient's name, age, and phone number at the start of the
                      encounter. This creates a new record that can be followed up later.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : selectedPatient ? (
              <div>
                <Button
                  onClick={() => setShowEncounterRecorder(false)}
                  variant="outline"
                  className="mb-4"
                >
                  ← Back to New Patient
                </Button>
                <EncounterRecorder
                  patient={selectedPatient}
                  doctorName={doctorName}
                  onSave={(encounter) => {
                    setEncounters([...encounters, encounter]);
                    setShowEncounterRecorder(false);
                    alert('Encounter saved successfully!');
                  }}
                />
              </div>
            ) : null}
          </TabsContent>

          {/* TAB 2: SURGICAL PATIENTS */}
          <TabsContent value="surgical-patients" className="mt-6 space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Surgical Patients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {surgicalPatients.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-500">No surgical patients yet.</p>
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        To add a surgical patient: First create an OPD patient, then in the "Old Patient" tab,
                        click "Start Surgery" to transition them to surgical workflow.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : !showSurgicalRecorder ? (
                  <div className="space-y-4">
                    {surgicalPatients.map((patient) => (
                      <Card key={patient.id} className="border-l-4 border-l-red-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Age: {patient.age} | Phone: {patient.phoneNumber}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge
                                  variant={
                                    patient.surgicalStatus === 'pre-surgical'
                                      ? 'secondary'
                                      : patient.surgicalStatus === 'post-surgical'
                                      ? 'default'
                                      : 'outline'
                                  }
                                >
                                  {patient.surgicalStatus === 'pre-surgical' && '🔄 Pre-Surgical'}
                                  {patient.surgicalStatus === 'intra-surgical' && '⚕️ In Surgery'}
                                  {patient.surgicalStatus === 'post-surgical' && '✅ Post-Surgical'}
                                  {patient.surgicalStatus === 'recovered' && '🎉 Recovered'}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedSurgicalPatient(patient);
                                setShowSurgicalRecorder(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Continue Surgery Record
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : selectedSurgicalPatient ? (
                  <div>
                    <Button
                      onClick={() => setShowSurgicalRecorder(false)}
                      variant="outline"
                      className="mb-4"
                    >
                      ← Back to Surgical Patients
                    </Button>
                    <SurgicalEncounterRecorder
                      patient={selectedSurgicalPatient}
                      doctorName={doctorName}
                      onSave={handleSaveSurgicalEncounter}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: OLD PATIENT RECOVERY */}
          <TabsContent value="old-patient" className="mt-6 space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Patient History & Encounters</CardTitle>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <p className="text-gray-500">No patients found. Create a new patient to get started.</p>
                ) : (
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <Card key={patient.id} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Age: {patient.age} | Phone: {patient.phoneNumber}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Created: {new Date(patient.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline">View Encounters</Button>
                              <Button
                                onClick={() => transitionOPDtoSurgical(patient)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Start Surgery
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: REMINDERS */}
          <TabsContent value="reminders" className="mt-6 space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                {reminders.length === 0 ? (
                  <p className="text-gray-500">No reminders. They will appear when you set them during encounters.</p>
                ) : (
                  <div className="space-y-4">
                    {reminders
                      .filter((r) => r.status === 'active')
                      .sort((a, b) => new Date(a.reminderDateTime).getTime() - new Date(b.reminderDateTime).getTime())
                      .map((reminder) => (
                        <Card key={reminder.id} className="border-l-4 border-l-yellow-500">
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold">{reminder.title}</h3>
                                <p className="text-sm text-gray-600">{reminder.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="secondary">
                                    {new Date(reminder.reminderDateTime).toLocaleDateString()}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {new Date(reminder.reminderDateTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </Badge>
                                  <Badge variant="outline">{reminder.reminderType}</Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => completeReminder(reminder.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteReminder(reminder.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}

                {/* Completed Reminders */}
                {reminders.filter((r) => r.status === 'completed').length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-lg mb-4 text-gray-600">Completed</h3>
                    {reminders
                      .filter((r) => r.status === 'completed')
                      .map((reminder) => (
                        <Card key={reminder.id} className="opacity-50">
                          <CardContent className="pt-4">
                            <p className="line-through text-gray-500">{reminder.title}</p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: SEARCH */}
          <TabsContent value="search" className="mt-6 space-y-4">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Search Patients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter patient name or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchPatients()}
                  />
                  <Button onClick={searchPatients} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4" />
                    Search
                  </Button>
                </div>

                {/* Quick Access to Recent Patients */}
                {patients.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-bold mb-4">Recent Patients</h3>
                    <div className="space-y-2">
                      {patients.slice(-5).map((patient) => (
                        <Card key={patient.id} className="cursor-pointer hover:bg-gray-50">
                          <CardContent className="pt-4">
                            <p className="font-medium">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{patient.phoneNumber}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
