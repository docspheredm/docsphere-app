# Surgical Framework - Architecture & Implementation Guide

## Component Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     MediVoice Records                           │
│                     (Next.js App)                               │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
        ┌──────▼──────┐           ┌──────────▼──────────┐
        │ OPD Workflow │           │ Surgical Workflow   │
        │ (Existing)  │           │ (New Phase 4)       │
        └──────┬──────┘           └──────────┬──────────┘
               │                              │
        ┌──────▼──────┐           ┌──────────▼──────────┐
        │ Encounter   │           │ Surgical Encounter  │
        │ Recorder    │           │ Recorder            │
        │ (9 steps)   │           │ (5 stages)          │
        └──────┬──────┘           └──────────┬──────────┘
               │                              │
        ┌──────▼──────────────────────────────▼──────────┐
        │         Follow-up Visit System                  │
        │ (Classification & Linking)                      │
        └──────────────────────┬──────────────────────────┘
                               │
        ┌──────────────────────▼──────────────────────────┐
        │              API Layer                           │
        │  ┌────────────┬────────────┬──────────────────┐ │
        │  │ Surgical   │ Surgical   │ Follow-up Visits │ │
        │  │ Patients   │ Encounters │ API              │ │
        │  └────────────┴────────────┴──────────────────┘ │
        └──────────────────────┬──────────────────────────┘
                               │
        ┌──────────────────────▼──────────────────────────┐
        │              Database Layer                      │
        │  (In-memory now, Supabase PostgreSQL later)     │
        └───────────────────────────────────────────────────┘
```

## File Organization

```
src/
├── components/
│   └── app/
│       ├── medical-dashboard.tsx ✅ UPDATED
│       │   ├── Surgical Patients Tab (NEW)
│       │   ├── OPD-to-Surgical Transition
│       │   └── Patient Management UI
│       │
│       ├── surgical-encounter-recorder.tsx ✅ NEW
│       │   ├── Stage 1: Pre-Surgical Investigations
│       │   ├── Stage 2: Pre-Anesthetic Checkup
│       │   ├── Stage 3: Surgery Plan
│       │   ├── Stage 4: Surgical Notes
│       │   └── Stage 5: Post-Op Follow-up
│       │
│       └── encounter-recorder.tsx ✅ UPDATED
│           ├── Existing 9-Step OPD Recording
│           └── Follow-up Visit Classification (NEW)
│
├── app/
│   └── api/
│       ├── surgical-patients/
│       │   └── route.ts ✅ NEW
│       │       ├── GET: List/Filter surgical patients
│       │       └── POST: Create surgical patient
│       │
│       ├── surgical-encounters/
│       │   └── route.ts ✅ NEW
│       │       ├── GET: List/Filter encounters
│       │       └── POST: Create encounter
│       │
│       ├── followup-visits/
│       │   └── route.ts ✅ NEW
│       │       ├── GET: List/Filter follow-ups
│       │       └── POST: Create follow-up visit
│       │
│       └── [existing routes]
│
└── lib/
    └── types.ts ✅ UPDATED
        ├── PreSurgicalInvestigation interface
        ├── PreAestheticCheckup interface
        ├── SurgeryPlan interface
        ├── SurgicalNotes interface
        ├── PostSurgeryFollowup interface
        ├── SurgicalPatient interface
        ├── SurgicalEncounter interface
        ├── FollowupVisit interface
        ├── PatientJourney interface
        └── FollowupType union type
```

## Component State Flow

### Medical Dashboard State

```typescript
// Surgical Patient Management
const [surgicalPatients, setSurgicalPatients] = useState<SurgicalPatient[]>([]);
const [surgicalEncounters, setSurgicalEncounters] = useState<SurgicalEncounter[]>([]);
const [selectedSurgicalPatient, setSelectedSurgicalPatient] = useState<SurgicalPatient | null>(null);
const [showSurgicalRecorder, setShowSurgicalRecorder] = useState(false);

// Handlers
const transitionOPDtoSurgical = async (opdPatient: Patient) => {
  // 1. Convert Patient → SurgicalPatient
  // 2. POST to /api/surgical-patients
  // 3. Add to surgicalPatients state
  // 4. Show surgical encounter recorder
}

const handleSaveSurgicalEncounter = (encounter: SurgicalEncounter) => {
  // 1. Save encounter to state
  // 2. Update patient's surgicalEncounters array
  // 3. Update patient's surgicalStatus
  // 4. Show confirmation
}
```

### Surgical Encounter Recorder State

```typescript
// Stage Management
const [currentStage, setCurrentStage] = useState<SurgicalStage>('presurgical-investigations');
const [surgeryCompleted, setSurgeryCompleted] = useState(false);

// Investigation Tracking
const [preSurgicalInvestigations, setPreSurgicalInvestigations] = useState<PreSurgicalInvestigation[]>([]);
const [newInvestigation, setNewInvestigation] = useState({
  investigationType: 'blood-test',
  testName: '',
  status: 'ordered',
});

// Anesthetic Assessment
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
  urgencyLevel: 'elective',
});

// Surgical Notes (Critical)
const [surgicalNotes, setSurgicalNotes] = useState<Partial<SurgicalNotes>>({
  surgeon: doctorName,
  anesthesiaTechnique: '',
  approach: '',
  findings: '',
  proceduresPerformed: [],
  bloodLoss: '0 ml',
});

// Post-Op Follow-up
const [postSurgeryFollowup, setPostSurgeryFollowup] = useState<Partial<PostSurgeryFollowup>>({
  plannedDate: new Date().toISOString().split('T')[0],
  visitNumber: 1,
  woundStatus: '',
  status: 'scheduled',
});
```

### Encounter Recorder Follow-up State

```typescript
// Follow-up Detection
const [isFollowupVisit, setIsFollowupVisit] = useState(
  previousEncounters && previousEncounters.length > 0
);

// Follow-up Classification
const [followupType, setFollowupType] = useState<
  'same-condition' | 'additional-new-condition' | 'entirely-new-condition'
>('same-condition');

const [newConditionDescription, setNewConditionDescription] = useState('');

// Handler
const handleCompleteEncounter = () => {
  const encounter: Encounter = { /* ... */ };
  
  let followupVisit: FollowupVisit | undefined;
  if (isFollowupVisit && previousEncounters?.length > 0) {
    followupVisit = {
      // Create FollowupVisit with classification
      followupType,
      originalEncounterId: previousEncounters[0].id,
      // ... other fields
    };
  }
  
  onSave(encounter, followupVisit);
}
```

## Data Flow Sequence Diagrams

### OPD to Surgical Transition

```
┌─────────────┐
│ OPD Patient │
└──────┬──────┘
       │
       │ 1. Doctor clicks "Start Surgery" 
       │    in Old Patient tab
       │
       ↓
┌──────────────────────────────────────┐
│ transitionOPDtoSurgical()             │
│ ├─ Create SurgicalPatient object      │
│ ├─ Copy OPD patient data              │
│ ├─ Set surgicalStatus = 'pre-surgical'│
│ └─ Set originalOPDEncounterId         │
└──────┬───────────────────────────────┘
       │
       │ 2. POST /api/surgical-patients
       │
       ↓
┌──────────────────────────────────────┐
│ API Response                          │
│ ├─ id: 'patient-123'                 │
│ ├─ surgicalStatus: 'pre-surgical'    │
│ └─ originalOPDEncounterId: 'enc-456' │
└──────┬───────────────────────────────┘
       │
       │ 3. Update surgicalPatients[]
       │    setSelectedSurgicalPatient()
       │    setShowSurgicalRecorder(true)
       │
       ↓
┌──────────────────────────────────────┐
│ Surgical Encounter Recorder Opens     │
│ Ready for investigations              │
└──────────────────────────────────────┘
```

### Surgical Workflow Progression

```
┌──────────────────────────────────┐
│ Stage 1: Investigations          │
│ Add blood tests, imaging, etc.   │
│ ↓ Save & Continue               │
└──────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ Stage 2: Anesthetic Checkup      │
│ ASA grade, airway assessment     │
│ ✓ Clearance required to continue │
│ ↓ Save & Continue               │
└──────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ Stage 3: Surgery Plan            │
│ Date, time, approach             │
│ ↓ Save & Continue               │
└──────────────────────────────────┘
       │
       ↓
┌──────────────────────────────────┐
│ Stage 4: Surgical Notes (CRITICAL)│
│ - Anesthesia technique           │
│ - Approach & findings            │
│ - Biopsies & cultures            │
│ - Implants (serial/batch)        │
│ ✓ Required fields validation     │
│ ↓ Mark Surgery Complete          │
└──────────────────────────────────┘
       │
       │ surgeryCompleted = true
       │ surgicalStatus = 'post-surgical'
       │
       ↓
┌──────────────────────────────────┐
│ Stage 5: Post-Op Follow-up       │
│ Wound status, suture removal     │
│ ↓ Complete & Save               │
└──────────────────────────────────┘
       │
       │ POST /api/surgical-encounters
       │
       ↓
┌──────────────────────────────────┐
│ Encounter Saved                  │
│ Patient status updated           │
│ Return to Surgical Patients list │
└──────────────────────────────────┘
```

### Follow-up Visit Workflow

```
┌──────────────────────────────┐
│ Patient returns for follow-up │
│ (previousEncounters.length > 0)
└──────────────────┬───────────┘
                   │
                   ↓
┌──────────────────────────────────────┐
│ isFollowupVisit = true               │
│ Show follow-up classification UI     │
│ Display previous encounters          │
└──────────────────┬───────────────────┘
                   │
           ┌───────┴────────┐
           ↓                ↓
    ┌────────────┐   ┌──────────────┐
    │ Same-cond  │   │ Add/Entirely  │
    │ No desc    │   │ New (required)│
    └────────────┘   └──────────────┘
           │                │
           └────────┬───────┘
                    ↓
        ┌─────────────────────┐
        │ Complete Encounter  │
        │ handleComplete()    │
        │ ├─ Create Encounter │
        │ ├─ Create FollowUp  │
        │ │  - followupType   │
        │ │  - linkedToId     │
        │ │  - tagged with UI │
        │ └─ onSave()         │
        └────────┬────────────┘
                 │
         ┌───────┴────────┐
         │                │
         ↓                ↓
    POST /api/     POST /api/
    encounters     followup-visits
         │                │
         └────────┬───────┘
                  ↓
         Display confirmation
         Link visible in UI
```

## API Endpoint Details

### POST /api/surgical-patients
```typescript
Request:
{
  firstName: string,
  lastName: string,
  age: number,
  phoneNumber: string,
  email?: string,
  gender: 'M' | 'F' | 'Other',
  surgicalStatus: 'pre-surgical',
  originalOPDEncounterId?: string,
  surgicalEncounters?: string[]
}

Response (201):
{
  success: true,
  data: SurgicalPatient {
    id: 'patient-1234567890',
    firstName, lastName, age, phoneNumber, email, gender,
    surgicalStatus: 'pre-surgical',
    originalOPDEncounterId: 'enc-456',
    surgicalEncounters: [],
    transitionedFromOPDDate: '2025-01-15T10:30:00Z',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z'
  },
  message: 'Surgical patient created successfully'
}
```

### POST /api/surgical-encounters
```typescript
Request:
{
  patientId: string,
  doctorName: string,
  doctorId?: string,
  originalOPDEncounterId?: string,
  preSurgicalInvestigations?: PreSurgicalInvestigation[],
  preAestheticCheckup?: PreAestheticCheckup,
  surgeryPlan?: SurgeryPlan,
  surgicalNotes?: SurgicalNotes,
  postSurgeryFollowups?: PostSurgeryFollowup[],
  status: 'completed',
  surgeryCompleted: boolean,
  surgeryCompletedDate?: string
}

Response (201):
{
  success: true,
  data: SurgicalEncounter {
    id: 'surg-enc-1234567890',
    patientId, doctorName, ...,
    createdAt, updatedAt,
    surgeryCompleted: true,
    surgeryCompletedDate: '2025-01-15T14:00:00Z'
  },
  message: 'Surgical encounter created successfully'
}
```

### POST /api/followup-visits
```typescript
Request:
{
  patientId: string,
  originalEncounterId: string,
  doctorName: string,
  followupType: 'same-condition' | 'additional-new-condition' | 'entirely-new-condition',
  newConditionDescription?: string,
  dateOfVisit?: string,
  patientComplaints?: string,
  status?: 'ongoing',
  tags: Array<{ type, label, color? }>
}

Response (201):
{
  success: true,
  data: FollowupVisit {
    id: 'followup-1234567890',
    patientId, originalEncounterId, doctorName, followupType,
    newConditionDescription: null,
    followupNumber: 1,
    dateOfVisit: '2025-01-20T10:00:00Z',
    status: 'ongoing',
    tags: [
      {
        type: 'same-condition',
        label: '🔄 Same Condition Follow-up',
        color: '#3b82f6'
      }
    ],
    createdAt, updatedAt
  },
  message: 'Follow-up visit created successfully'
}
```

## Type Safety Features

### Surgical Status Enum
```typescript
type SurgicalStatus = 
  | 'pre-surgical'      // Investigations, clearances pending
  | 'intra-surgical'    // Currently in operating room
  | 'post-surgical'     // Surgery completed, recovery phase
  | 'recovered';        // Fully recovered, discharged

// Enforced in SurgicalPatient interface
surgicalStatus: SurgicalStatus;
```

### Encounter Status Enum
```typescript
type SurgicalEncounterStatus =
  | 'pre-surgical'      // Pre-op phase
  | 'scheduled'         // Surgery date set
  | 'in-progress'       // Currently operating
  | 'completed'         // Surgery finished
  | 'post-recovery';    // Recovery phase

status: SurgicalEncounterStatus;
```

### Follow-up Type Enum
```typescript
type FollowupType =
  | 'same-condition'              // Continuing same complaint
  | 'additional-new-condition'    // New + old conditions
  | 'entirely-new-condition';     // Completely different issue

followupType: FollowupType;
```

## Error Handling

### Validation Rules

**Surgical Encounter Progression**:
- ❌ Cannot skip to surgery plan without anesthetic clearance
- ❌ Cannot mark surgery complete without required notes
- ✅ Auto-advance stages on completion

**Surgical Notes Validation**:
```typescript
const isValidSurgicalNotes = (notes: Partial<SurgicalNotes>) => {
  return !!(
    notes.anesthesiaTechnique?.trim() &&
    notes.approach?.trim() &&
    notes.findings?.trim()
  );
};
```

**Follow-up Classification**:
```typescript
if (followupType !== 'same-condition') {
  if (!newConditionDescription?.trim()) {
    return alert('Please describe the new condition');
  }
}
```

## Performance Considerations

- **State Optimization**: Uses React.useState for all component state
- **API Calls**: Minimal - surgical patient transition = 1 API call
- **UI Updates**: React re-renders only affected components
- **Memory**: In-memory arrays (fine for MVP, Supabase for production)

---

## Deployment Checklist

- [ ] Review all type definitions
- [ ] Test surgical encounter progression
- [ ] Verify follow-up classification works
- [ ] Validate API responses
- [ ] Check patient transition logic
- [ ] Test error scenarios
- [ ] Performance test with multiple patients
- [ ] Security review (HIPAA compliance)
- [ ] Mobile responsiveness check
- [ ] Prepare Supabase schema
- [ ] Set up database migrations
- [ ] Configure RLS policies
- [ ] Deploy to Vercel staging
- [ ] Production deployment

---

**Last Updated**: January 2025  
**Implementation Status**: ✅ Complete (MVP/Demonstration Phase)  
**Next Phase**: Supabase Integration & Mobile Development
