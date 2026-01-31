# Surgical Framework & Follow-Up Visit System Implementation

**Date**: January 2025  
**Status**: ✅ COMPLETED - Phase 4: Surgical Workflow & Follow-up System

---

## Overview

Successfully implemented a comprehensive surgical workflow system and follow-up visit tracking mechanism for the MediVoice Records platform. This allows OPD (Outpatient Department) patients to transition into surgical care workflows, with complete tracking of pre-surgical investigations, intra-operative procedures, post-operative recovery, and follow-up visits linked to original encounters.

---

## Components Created

### 1. **Surgical Encounter Recorder** (`surgical-encounter-recorder.tsx`)
**File**: `src/components/app/surgical-encounter-recorder.tsx` (664 lines)

A 5-stage surgical workflow interface:

1. **Pre-Surgical Investigations Stage**
   - Order tests: blood tests, imaging, ECG, echo, coagulation studies
   - Track investigation status: ordered → completed → abnormal/normal
   - Visual status indicators with badge colors

2. **Pre-Anesthetic Checkup Stage**
   - Anesthesiologist name
   - ASA grade classification (I-V + Emergency)
   - Medical optimization notes
   - Airway assessment (Mallampati score, jaw mobility, dentition)
   - Clearance for surgery checkbox (blocks progression)

3. **Surgery Plan Stage**
   - Surgery name/type
   - Urgency level (elective, urgent, emergency)
   - Planned date and time
   - Anesthetic technique planned
   - Pre-operative notes and special considerations

4. **Surgical Notes (Intra-operative) Stage** ⭐ Core Documentation
   - **Anesthesia Technique**: Type of anesthesia administered
   - **Blood Loss Tracking**: Quantified blood loss
   - **Surgical Approach**: Incision location and technique
   - **Intra-operative Findings**: Pathology and observations
   - **Complications**: Any complications encountered
   - **Samples & Cultures**: Biopsy and culture sample tracking
   - **Implants Used**: Device details (serial numbers, manufacturer, batch)
   - Mark surgery as complete (status → post-surgical)

5. **Post-Surgery Follow-up Stage**
   - Visit number tracking
   - Planned follow-up date
   - Wound status assessment
   - Suture removal tracking
   - Drain removal tracking
   - Physical examination notes
   - Further management plan

**Features**:
- Stage progress indicator with icons
- Color-coded status badges
- Patient header with surgical status
- Tab-based navigation between stages
- Automatic progression on completion
- Complete validation before surgery completion

### 2. **Updated Medical Dashboard** (`medical-dashboard.tsx`)
**File**: `src/components/app/medical-dashboard.tsx` (609 lines)

**New Tab Added**: Surgical Patients (between New Patient and Old Patient)

**Features**:
- **Surgical Patients Tab**: 
  - Lists all surgical patients with status badges
  - Status indicators: 🔄 Pre-Surgical, ⚕️ In Surgery, ✅ Post-Surgical, 🎉 Recovered
  - Quick access to continue surgery records
  - View surgical patient details

- **OPD-to-Surgical Transition**:
  - "Start Surgery" button in Old Patient tab
  - Converts OPD patient to SurgicalPatient
  - Maintains link via `originalOPDEncounterId`
  - Auto-transitions to surgical encounter recorder
  - Creates `transitionedFromOPDDate` timestamp

- **State Management**:
  - `surgicalPatients`: Array of SurgicalPatient records
  - `surgicalEncounters`: Array of completed surgical encounters
  - `selectedSurgicalPatient`: Current surgical patient being edited
  - `showSurgicalRecorder`: UI state for recorder visibility

- **Surgical Encounter Handler**:
  - `handleSaveSurgicalEncounter()`: Saves encounter and updates patient status
  - Updates surgical patient's status and surgical encounter list
  - Maintains proper TypeScript typing with SurgicalPatient interface

### 3. **Enhanced Encounter Recorder** (`encounter-recorder.tsx`)
**File**: `src/components/app/encounter-recorder.tsx` (437 lines)

**New Feature**: Follow-up Visit Classification & Linking

**Follow-up Visit Detection**:
- Automatically detects if patient has previous encounters
- Displays alert when follow-up visit detected
- Shows previous encounters in chronological order

**Follow-up Type Classification**:
Three classification options presented to doctor:

1. **Same Condition Follow-up** (🔄)
   - Continuing treatment for same condition
   - No new condition description needed

2. **Additional New Condition** (➕)
   - New condition in addition to previous
   - Requires brief description of new complaint
   - Links to original encounter for reference

3. **Entirely New Condition** (🆕)
   - Unrelated new condition
   - Different from previous visit
   - Tracked separately but linked to patient history

**Implementation**:
- Follow-up classification UI appears only in final step
- Previous encounters displayed with dates and doctor names
- New condition description field (conditional)
- Creates FollowupVisit object with:
  - Link to original encounter
  - Follow-up type and classification
  - Numbered follow-up tracking
  - UI tags for visual identification

**Props Updated**:
- Added `previousEncounters?: Encounter[]` parameter
- Updated `onSave` signature: `(encounter: Encounter, followupVisit?: FollowupVisit) => void`

### 4. **API Routes** 

#### A. Surgical Patients (`/api/surgical-patients`)
**File**: `src/app/api/surgical-patients/route.ts`

**GET Endpoints**:
- List all surgical patients
- Filter by status: `?status=pre-surgical|intra-surgical|post-surgical|recovered`
- Search by name or phone: `?search=query`

**POST Endpoints**:
- Create new surgical patient (from OPD transition)
- Required fields: firstName, lastName, phoneNumber
- Auto-generates: id, timestamps, surgical status

**Response Format**:
```json
{
  "success": true,
  "data": { SurgicalPatient },
  "count": 5
}
```

#### B. Surgical Encounters (`/api/surgical-encounters`)
**File**: `src/app/api/surgical-encounters/route.ts`

**GET Endpoints**:
- List all surgical encounters
- Filter by patient: `?patientId=id`
- Filter by status: `?status=pre-surgical|scheduled|in-progress|completed|post-recovery`
- Sorted by creation date (newest first)

**POST Endpoints**:
- Create new surgical encounter
- Required fields: patientId, doctorName, status, surgeryCompleted
- Auto-generates: id, timestamps

#### C. Follow-up Visits (`/api/followup-visits`)
**File**: `src/app/api/followup-visits/route.ts`

**GET Endpoints**:
- List all follow-up visits
- Filter by patient: `?patientId=id`
- Filter by original encounter: `?originalEncounterId=id`
- Filter by type: `?followupType=same-condition|additional-new-condition|entirely-new-condition`
- Sorted by date (newest first)

**POST Endpoints**:
- Create new follow-up visit
- Required fields: patientId, originalEncounterId, doctorName, followupType
- Auto-generates: id, timestamps
- Creates with status: 'ongoing'

**Response Format**:
```json
{
  "success": true,
  "data": { FollowupVisit },
  "count": 3
}
```

---

## Data Models Updated

### Types File: `src/lib/types.ts`

**9 New/Updated Interfaces**:

1. **PreSurgicalInvestigation**
   - investigationType: blood-test | imaging | ecg | echo | pts-inr | chest-xray | other
   - testName: string
   - status: ordered | completed | abnormal | normal
   - orderedDate: ISO timestamp
   - resultsDate?: ISO timestamp
   - resultsNotes?: string
   - clearedForSurgery: boolean

2. **PreAestheticCheckup**
   - anesthelogistName: string
   - asaGrade: I | II | III | IV | V | E
   - medicalOptimization?: string
   - airwayAssessment?: string
   - clearanceForSurgery: boolean
   - checkupDate: ISO timestamp

3. **SurgeryPlan**
   - surgeryName: string
   - plannedDate: ISO date
   - plannedTime: time string
   - surgeon: string
   - urgencyLevel: elective | urgent | emergency
   - anestheticTechnique?: string
   - notes?: string

4. **SurgicalNotes** (Most comprehensive)
   - surgeon: string
   - anesthesiaTechnique: string (required)
   - approach: string (required, incision location/type)
   - findings: string (required, intra-operative observations)
   - proceduresPerformed: string[]
   - complications?: string
   - bloodLoss: string (ml)
   - biopsies: Array with { sampleId, type, location, labRequest }
   - cultures: Array with { sampleId, type, location, cultureType }
   - implants: Array with { type, serialNumber, manufacturer, batchNumber }
   - drainageDetails?: string
   - postOpInstructions?: string

5. **PostSurgeryFollowup**
   - plannedDate: ISO date
   - visitNumber: number
   - woundStatus: string
   - suturRemovalDone?: boolean
   - drainRemovalDone?: boolean
   - physicalExamination?: string
   - furtherTreatment?: string
   - status: scheduled | completed | missed

6. **SurgicalPatient** (extends Patient)
   - surgicalStatus: pre-surgical | intra-surgical | post-surgical | recovered
   - originalOPDEncounterId?: string (link to OPD encounter)
   - surgicalEncounters?: string[] (array of encounter IDs)
   - transitionedFromOPDDate?: ISO timestamp

7. **SurgicalEncounter**
   - patientId: string
   - doctorName: string
   - originalOPDEncounterId?: string (if transitioned from OPD)
   - preSurgicalInvestigations?: PreSurgicalInvestigation[]
   - preAestheticCheckup?: PreAestheticCheckup
   - surgeryPlan?: SurgeryPlan
   - surgicalNotes?: SurgicalNotes
   - postSurgeryFollowups?: PostSurgeryFollowup[]
   - status: pre-surgical | scheduled | in-progress | completed | post-recovery
   - surgeryCompleted: boolean
   - surgeryCompletedDate?: ISO timestamp

8. **FollowupVisit** (Follow-up visit for OPD or post-surgical)
   - patientId: string
   - originalEncounterId: string (links to original OPD/surgical encounter)
   - followupType: same-condition | additional-new-condition | entirely-new-condition
   - followupNumber: number
   - newConditionDescription?: string (for additional-new/entirely-new)
   - dateOfVisit: ISO date
   - doctorName: string
   - status: ongoing | resolved | improved | worsened | referred
   - tags: Array with type, label, optional color
   - All encounter sections: greeting, patientComplaints, history, examination, diagnosis, treatment, investigations

9. **FollowupType** (Union type)
   - 'same-condition' | 'additional-new-condition' | 'entirely-new-condition'

---

## Workflow Diagrams

### OPD → Surgical Transition Flow
```
┌─────────────────┐
│  OPD Encounter  │
│  (New Patient)  │
└────────┬────────┘
         │
         │ Surgery Planned?
         ↓
    YES ─────→ Click "Start Surgery"
         │
         │
    ┌────────────────────────┐
    │ Patient Transitions to  │
    │ Surgical Workflow       │
    │ (originalOPDEncounterId)│
    └────────┬───────────────┘
             │
             ↓
      ┌─────────────────┐
      │ Surgical Patients Tab
      │ (Dashboard)     │
      └────────┬────────┘
             │
      ┌──────┴──────┬──────────────┐
      ↓             ↓              ↓
   Pre-Surg    In-Surgery    Post-Surg
   (Invests)  (Surgery Plan)  (Follow-up)
             & Surgical Notes
```

### Follow-up Visit Classification
```
┌─────────────────────┐
│ OPD Encounter #2    │
│ (Return Visit)      │
└────────┬────────────┘
         │
         │ Is this a follow-up?
         │ (Previous encounters exist)
         ↓
    ┌──────────────────────────────────┐
    │ Ask: What type of follow-up?     │
    ├──────────────────────────────────┤
    │ 🔄 Same Condition                │
    │    └─→ Continue treatment        │
    │ ➕ Additional New Condition       │
    │    └─→ New complaint + old condition
    │ 🆕 Entirely New Condition        │
    │    └─→ Completely different issue│
    └──────────────────────────────────┘
         │
         ↓
    Create FollowupVisit
    + Link to Original Encounter
    + Tag for UI Display
```

---

## Key Features Implemented

### ✅ Surgical Workflow Management
- Complete pre-surgical assessment pipeline
- Intra-operative documentation with anesthesia details
- Post-operative follow-up tracking
- Integration with medical investigation ordering
- Implant and device tracking with serial numbers

### ✅ Patient Transition System
- Seamless OPD → Surgical workflow transition
- Maintains bidirectional link via encounter IDs
- Patient status tracking (pre/intra/post/recovered)
- Preserves original OPD encounter reference

### ✅ Follow-up Visit Tracking
- Automatic detection of follow-up visits
- Three-tier classification system
- Links follow-up visits to original encounters
- Visual tagging system for quick identification
- Supports multiple follow-up visits per patient

### ✅ Data Consistency
- Type-safe TypeScript interfaces
- Proper nullable/optional field handling
- Encounter section structure maintained
- Status enumerations prevent invalid states

### ✅ API Foundation
- RESTful endpoints for all surgical workflows
- Query filtering and search capabilities
- Proper HTTP status codes
- JSON response format consistency
- Ready for Supabase integration

---

## Integration Points

### Medical Dashboard Integration
```typescript
// Surgical Patients Tab Added
<TabsTrigger value="surgical-patients">
  <Stethoscope className="w-4 h-4" />
  Surgical
</TabsTrigger>
```

### Encounter Recorder Integration
```typescript
// Follow-up visit detection in final step
if (currentStep === 'followup' && isFollowupVisit && previousEncounters.length > 0) {
  // Show classification UI
}
```

### API Response Consistency
All endpoints return:
```json
{
  "success": boolean,
  "data": SingleObject | ObjectArray,
  "count": number,
  "message": "description"
}
```

---

## Next Steps / Future Enhancements

1. **Supabase Integration**
   - Replace in-memory arrays with Supabase PostgreSQL queries
   - Implement Row-Level Security (RLS) for patient data
   - Add transaction support for multi-step workflows

2. **Advanced Features**
   - Implant registry with recalls and adverse events
   - Surgical complication tracking and analytics
   - Post-operative pain and mobility scoring
   - Rehabilitation protocol assignment
   - Surgical site infection monitoring

3. **Mobile Optimization**
   - React Native integration for surgical module
   - Offline mode for surgical data capture
   - Real-time audio recording in native app

4. **Reporting & Analytics**
   - Surgical outcome reports
   - Follow-up compliance tracking
   - Time-to-first-follow-up metrics
   - Complications analytics

5. **Notifications**
   - Pre-operative checklist reminders
   - Post-operative follow-up reminders
   - Test result notifications
   - Wound care alerts

---

## Files Modified/Created

### New Components (2 files)
- ✅ `src/components/app/surgical-encounter-recorder.tsx` (664 lines)
- ✅ `src/components/app/encounter-recorder.tsx` (updated, +160 lines)

### New API Routes (3 files)
- ✅ `src/app/api/surgical-patients/route.ts` (78 lines)
- ✅ `src/app/api/surgical-encounters/route.ts` (72 lines)
- ✅ `src/app/api/followup-visits/route.ts` (86 lines)

### Updated Components (1 file)
- ✅ `src/components/app/medical-dashboard.tsx` (updated, +80 lines)

### Updated Types (1 file)
- ✅ `src/lib/types.ts` (updated, +150 lines for surgical models)

---

## Testing Checklist

- [ ] Surgical patient can be created from OPD patient
- [ ] Pre-surgical investigations can be added
- [ ] Anesthetic checkup blocks surgery plan until cleared
- [ ] Surgery plan accepts all date/time inputs
- [ ] Surgical notes validate required fields
- [ ] Surgery completion updates patient status
- [ ] Post-op follow-up can be created
- [ ] Follow-up visit detection works
- [ ] All three follow-up types can be selected
- [ ] New condition description required for appropriate types
- [ ] API endpoints return correct response format
- [ ] Filters work on all GET endpoints
- [ ] Searches work on patient list
- [ ] Date/time stamps auto-generated correctly
- [ ] Previous encounters shown in follow-up UI

---

## Technical Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useRef)
- **API**: Next.js API routes (ready for Supabase)
- **Types**: Full TypeScript interfaces

---

## Deployment Notes

### Production Readiness
⚠️ **Current State**: Demonstration/MVP with in-memory storage

### To Deploy to Production:
1. Replace in-memory arrays in API routes with Supabase queries
2. Implement PostgreSQL schema for surgical tables
3. Add Row-Level Security policies
4. Enable audio storage in Supabase Storage buckets
5. Configure Whisper API for transcription
6. Set up deployment pipeline (Vercel for web)

---

**Implementation Date**: January 2025  
**Status**: Phase 4 Complete - Ready for API Integration & Testing  
**Next Phase**: Supabase Integration & Mobile App Development
