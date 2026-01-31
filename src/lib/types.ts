/**
 * Medical Voice-to-Text Encounter Recording System
 * Data models for patient, encounter, investigation, and reminder management
 */

// ============= PATIENT =============
export interface Patient {
  id: string; // UUID
  firstName: string;
  lastName: string;
  age: number;
  phoneNumber: string;
  email?: string;
  gender?: 'M' | 'F' | 'Other';
  medicalHistory?: string[];
  allergies?: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

// ============= INVESTIGATION =============
export interface Investigation {
  id: string;
  encounterId: string;
  orderedBy: string; // doctor name
  testName: string;
  testDescription?: string;
  orderedDate: string; // ISO timestamp
  expectedReportDate?: string; // ISO timestamp
  status: 'ordered' | 'report-awaited' | 'completed';
  result?: string;
  reportFile?: string; // URL to uploaded report/file
  resultDate?: string; // ISO timestamp
  notes?: string;
}

// ============= PHYSIOTHERAPY PLAN =============
export interface PhysiotherapyPlan {
  id: string;
  encounterId: string;
  planDescription: string;
  duration: string; // e.g., "4 weeks"
  frequency: string; // e.g., "3 times per week"
  progressNotes?: string; // Attachment URL or embedded notes
  attachedFile?: string; // URL to Excel sheet
  startDate: string; // ISO timestamp
  expectedEndDate?: string;
}

// ============= ENCOUNTER SECTION (Voice Recording) =============
export interface EncounterSection {
  id: string;
  type: 'greeting' | 'complaints' | 'history' | 'examination' | 'diagnosis' | 'treatment-plan' | 'investigations' | 'physiotherapy' | 'followup';
  speaker: 'doctor' | 'patient';
  timestamp: string; // ISO timestamp
  recordingUrl?: string; // URL to audio blob
  transcript: string;
  duration: number; // in seconds
}

// ============= ENCOUNTER (Main Medical Record) =============
export interface Encounter {
  id: string;
  patientId: string;
  doctorName: string;
  doctorId?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string;
  dateOfEncounter: string; // ISO date
  
  // Encounter sections
  greeting?: EncounterSection;
  complaints?: EncounterSection[]; // can have multiple complaints
  historyOfPresentComplaints?: EncounterSection;
  examinationFindings?: EncounterSection;
  diagnosis?: EncounterSection;
  treatmentPlan?: EncounterSection;
  
  // Related entities
  investigations?: Investigation[];
  physiotherapyPlan?: PhysiotherapyPlan;
  
  // Follow-up
  followupDate?: string; // ISO date
  followupNotes?: string;
  
  // Summary/notes
  generalNotes?: string;
  status: 'draft' | 'completed' | 'reviewed';
}

// ============= REMINDER =============
export interface MedicalReminder {
  id: string;
  patientId?: string;
  encounterId?: string;
  investigationId?: string;
  reminderType: 'report-awaited' | 'followup-visit' | 'physio-session' | 'custom';
  title: string;
  description?: string;
  scheduledDate: string; // ISO date
  scheduledTime: string; // HH:mm format
  reminderDateTime: string; // ISO timestamp
  status: 'active' | 'completed' | 'dismissed';
  createdAt: string; // ISO timestamp
  completedAt?: string;
  notificationSent: boolean;
  notificationSentAt?: string;
}

// ============= DOCTOR PROFILE =============
export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  licenseNumber: string;
  email: string;
  phoneNumber: string;
  clinicName?: string;
  clinicAddress?: string;
  createdAt: string;
  updatedAt: string;
}

// ============= AUDIO RECORDING STATE =============
export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordedChunks: Blob[];
  currentTime: number; // in seconds
  audioContext?: AudioContext;
  mediaRecorder?: MediaRecorder;
}

// ============= SURGICAL WORKFLOW =============

// Pre-Surgical Investigations
export interface PreSurgicalInvestigation {
  id: string;
  surgicalEncounterId: string;
  investigationType: 'blood-test' | 'imaging' | 'ecg' | 'echo' | 'pts-inr' | 'chest-xray' | 'other';
  testName: string;
  orderedDate: string; // ISO timestamp
  expectedDate?: string;
  completedDate?: string;
  result?: string;
  status: 'ordered' | 'completed' | 'abnormal' | 'normal';
  reportFile?: string; // URL to uploaded report
  notes?: string;
  clearedForSurgery?: boolean;
  clearanceDate?: string;
}

// Pre-Anesthetic Checkup
export interface PreAestheticCheckup {
  id: string;
  surgicalEncounterId: string;
  checkupDate: string; // ISO timestamp
  anesthelogistName: string;
  anesthelogistId?: string;
  asa_grade?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'E'; // ASA physical status
  medicalOptimization?: string;
  dentalStatus?: string;
  fasting_duration?: string; // e.g., "6 hours"
  premedication?: string;
  airwayAssessment?: string;
  anesthesiaRisk?: string;
  clearanceForSurgery: boolean;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

// Surgery Plan & Details
export interface SurgeryPlan {
  id: string;
  surgicalEncounterId: string;
  surgeryName: string;
  surgeryDescription?: string;
  plannedDate: string; // ISO date
  plannedTime: string; // HH:mm format
  plannedDuration?: string; // e.g., "2 hours"
  surgeon: string;
  surgeonId?: string;
  assistant?: string;
  operatingTheater?: string;
  anestheticTechnique?: string;
  position?: string; // e.g., "supine", "prone"
  incision?: string;
  approach?: string;
  urgencyLevel: 'emergency' | 'urgent' | 'elective'; // surgery urgency
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Surgical Notes (Intra-operative documentation)
export interface SurgicalNotes {
  id: string;
  surgicalEncounterId: string;
  surgeryDate: string; // ISO timestamp
  surgeon: string;
  surgeonId?: string;
  anesthesiologist?: string;
  anesthesiologistId?: string;
  actualStartTime: string; // ISO timestamp
  actualEndTime: string; // ISO timestamp
  durationMinutes: number;
  
  // Anesthesia Details
  anesthesiaTechnique: string; // e.g., "General anesthesia with spinal block"
  anesthesiaAgent?: string;
  bloodLoss?: string; // e.g., "200 ml"
  
  // Intra-operative Details
  approach: string; // surgical approach
  findings: string; // what was found during surgery
  proceduresPerformed: string[]; // list of procedures done
  complications?: string; // any intra-operative complications
  bloodProducts?: string; // blood transfusions, if any
  
  // Samples & Cultures
  biopsySamples?: Array<{
    sampleId: string;
    type: string; // e.g., "tissue", "fluid"
    location: string;
    labRequest: string;
  }>;
  cultureSamples?: Array<{
    sampleId: string;
    type: string; // e.g., "swab", "fluid"
    location: string;
    cultureType: string; // e.g., "bacterial", "fungal"
  }>;
  
  // Implants Used
  implants?: Array<{
    implantId: string;
    type: string; // e.g., "stent", "prosthesis", "plate"
    name: string;
    serialNumber?: string;
    manufacturer?: string;
    batchNumber?: string;
  }>;
  
  // Closure & Dressing
  closure: string; // suture type, method
  dressing?: string;
  drainage?: string; // drain placement, type
  
  // Post-operative Instructions
  postOpInstructions?: string;
  restrictions?: string[];
  medications?: string[];
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Post-Surgery Follow-up
export interface PostSurgeryFollowup {
  id: string;
  surgicalEncounterId: string;
  plannedDate?: string; // ISO date
  plannedTime?: string; // HH:mm format
  actualDate?: string; // When follow-up actually happened
  visitNumber: number; // 1st follow-up, 2nd follow-up, etc.
  
  // Clinical Assessment
  woundStatus?: string; // wound healing status
  suturRemovalDone?: boolean;
  suturRemovalDate?: string;
  drainRemovalDone?: boolean;
  drainRemovalDate?: string;
  complicationsSinceSurgery?: string[];
  
  // Investigation Results
  investigationResults?: string;
  biopsyResults?: string;
  cultureResults?: string;
  
  // Physical Findings
  physicalExamination?: string;
  mobilityStatus?: string;
  functionalStatus?: string;
  
  // Further Management
  furtherTreatment?: string;
  medications?: string;
  nextFollowupDate?: string;
  status: 'scheduled' | 'completed' | 'pending';
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Surgical Patient (extends Patient)
export interface SurgicalPatient extends Patient {
  surgicalStatus: 'pre-surgical' | 'intra-surgical' | 'post-surgical' | 'recovered';
  originalOPDEncounterId?: string; // Link to OPD encounter if transitioned from OPD
  surgicalEncounters?: string[]; // Array of surgical encounter IDs
  transitionedFromOPDDate?: string; // When patient transitioned from OPD to surgical
}

// Surgical Encounter (Main surgical record)
export interface SurgicalEncounter {
  id: string;
  patientId: string; // Can be OPD patient transitioning to surgery
  doctorName: string;
  doctorId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Link to Original OPD Encounter (if applicable)
  originalOPDEncounterId?: string;
  
  // Surgical Workflow Stages
  preSurgicalInvestigations?: PreSurgicalInvestigation[];
  preAestheticCheckup?: PreAestheticCheckup;
  surgeryPlan?: SurgeryPlan;
  surgicalNotes?: SurgicalNotes;
  postSurgeryFollowups?: PostSurgeryFollowup[];
  
  // Status Tracking
  status: 'pre-surgical' | 'scheduled' | 'in-progress' | 'completed' | 'post-recovery';
  surgeryCompleted: boolean;
  surgeryCompletedDate?: string;
}

// ============= FOLLOW-UP VISIT SYSTEM =============

export type FollowupType = 'same-condition' | 'additional-new-condition' | 'entirely-new-condition';

// Follow-up Visit Record
export interface FollowupVisit {
  id: string;
  patientId: string;
  
  // Link to Original Encounter
  originalEncounterId: string; // The encounter this is a follow-up for
  
  // Follow-up Classification
  followupType: FollowupType; // What type of follow-up
  followupNumber: number; // 1st follow-up, 2nd follow-up, etc.
  
  // For "additional-new-condition" or "entirely-new-condition"
  newConditionDescription?: string; // Description of new complaint/condition
  newICD10Code?: string; // If new diagnosis was given
  
  // Encounter Details (uses same structure as regular encounter)
  doctorName: string;
  doctorId?: string;
  dateOfVisit: string; // ISO date
  
  // Same Encounter Sections as OPD
  greeting?: string;
  patientComplaints?: string;
  historyOfPresentComplaints?: string;
  examinationFindings?: string;
  diagnosis?: string;
  treatment?: string;
  investigations?: string;
  
  // Status & Outcome
  status: 'ongoing' | 'resolved' | 'improved' | 'worsened' | 'referred';
  referralDetails?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  tags: Array<{
    type: 'same-condition' | 'additional-new' | 'entirely-new';
    label: string; // Display label
    color?: string; // For UI styling
  }>;
}

// Patient Journey (for tracking patient across OPD and Surgical workflows)
export interface PatientJourney {
  id: string;
  patientId: string;
  
  // Timeline
  firstOPDEncounterId?: string;
  firstOPDDate?: string;
  
  surgicalEncounterIds?: string[];
  firstSurgeryDate?: string;
  
  followupVisitIds?: string[];
  
  // Current Status
  currentWorkflow: 'opd' | 'surgical' | 'both';
  lastVisitDate?: string;
  lastVisitType: 'opd' | 'surgical' | 'follow-up';
  
  // Summary
  totalOPDEncounters: number;
  totalSurgicalEncounters: number;
  totalFollowupVisits: number;
  
  activeConditions?: string[]; // Current ongoing conditions
  
  createdAt: string;
  updatedAt: string;
}

