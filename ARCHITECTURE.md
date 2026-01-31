# MediVoice Records - System Architecture & Flow Diagrams

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MediVoice Records Platform                       │
├──────────────────────────────┬──────────────────────────────────────────┤
│                              │                                           │
│  CLIENT LAYER                │  SERVER LAYER           DATABASE LAYER   │
│  ┌─────────────────────────┐ │ ┌────────────────────┐ ┌─────────────┐  │
│  │   Web Browser           │ │ │  Next.js Server    │ │  Supabase   │  │
│  │  (Desktop/Tablet)       │ │ │  (API Routes)      │ │ PostgreSQL  │  │
│  │  ┌─────────────────────┐│ │ │ ┌────────────────┐ │ │ Tables:     │  │
│  │  │ Medical Dashboard   ││ │ │ │ /api/patients  │ │ │  - patients │  │
│  │  │ - New Patient       ││─┼─│ │ /api/encounters│ │ │  - encounters
│  │  │ - Old Patient       ││ │ │ │ /api/reminders │ │ │  - investigations
│  │  │ - Reminders         ││ │ │ │ /investigations│ │ │  - reminders
│  │  │ - Search            ││ │ │ └────────────────┘ │ │  - physio_plans
│  │  └─────────────────────┘│ │ │                    │ │  - doctors
│  │  ┌─────────────────────┐│ │ │ ┌────────────────┐ │ │              │  │
│  │  │ Encounter Recorder  ││ │ │ │ Speech-to-Text │ │ │  Storage:   │  │
│  │  │ - Web Audio API     ││─┼─│ │ (Whisper API)  │ │ │  - recordings
│  │  │ - 9 Sections        ││ │ │ │ (OpenAI)       │ │ │  - reports
│  │  │ - Transcription     ││ │ │ │                │ │ │  - physio files
│  │  └─────────────────────┘│ │ │ └────────────────┘ │ │              │  │
│  └─────────────────────────┘ │ └────────────────────┘ └─────────────┘  │
│                              │                                          │
│  ┌─────────────────────────┐ │ ┌────────────────────┐                  │
│  │  React Native (Mobile)  │ │ │ Authentication &   │                  │
│  │  iOS/Android (Expo)     │ │ │ Authorization      │                  │
│  │  ┌─────────────────────┐│ │ │ (Supabase Auth)    │                  │
│  │  │ Dashboard Screen    ││─┼─│                    │                  │
│  │  │ Recording Screen    ││ │ │ ┌────────────────┐ │                  │
│  │  │ Reminders Screen    ││ │ │ │ Push           │ │                  │
│  │  │ Search Screen       ││ │ │ │ Notifications  │ │                  │
│  │  └─────────────────────┘│ │ │ │ (Expo/FCM/APNs) │ │                  │
│  │  (Offline Sync Ready)   │ │ │ └────────────────┘ │                  │
│  └─────────────────────────┘ │ └────────────────────┘                  │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## 🔄 Encounter Recording Flow

```
STEP 1: NEW PATIENT ENTRY
┌────────────────────────────────┐
│ Doctor fills patient details   │
│ - Name, Age, Phone, Email      │
│ - Gender, Medical History      │
└────────────┬───────────────────┘
             │ Save
             ▼
        Database
     (patients table)


STEP 2: START ENCOUNTER RECORDING
┌────────────────────────────────┐
│ Select Patient                 │
│ Choose Doctor Name             │
│ Set Date & Time                │
└────────────┬───────────────────┘
             │
             ▼
        Create Encounter
       (encounters table)


STEP 3: RECORD 9 SECTIONS
┌────────────────────────────────┐
│ 1️⃣  Greeting                    │
│ 2️⃣  Patient Complaints          │
│ 3️⃣  History of Present Illness  │
│ 4️⃣  Examination Findings        │
│ 5️⃣  Diagnosis                   │
│ 6️⃣  Treatment Plan              │
│ 7️⃣  Investigations              │
│ 8️⃣  Physiotherapy Plan          │
│ 9️⃣  Follow-up Schedule          │
└────────────┬───────────────────┘
             │
             ├─► Each section:
             │   - Record audio (Web Audio API)
             │   - Identify speaker (Doctor/Patient)
             │   - Timestamp each entry
             │   - Transcribe with Whisper API
             │   - Manual edit option
             │   - Save to database
             │
             ▼
        Encounter Complete


STEP 4: AUTOMATIC REMINDERS
┌────────────────────────────────┐
│ If "Report Awaited" detected   │
│ Create reminder for date       │
│ Push notification setup        │
│ Add to Reminders list          │
└────────────┬───────────────────┘
             │
             ▼
    Reminder triggers on date
    Doctor gets notification
```

---

## 👤 Patient Search & Recovery Flow

```
SEARCH TAB
┌──────────────────────────────────┐
│ Enter Name OR Phone Number       │
└────────────┬─────────────────────┘
             │ Search
             ▼
    ┌────────────────────┐
    │ Query Database     │
    │ (ilike search)     │
    │ Fuzzy matching     │
    └────────┬───────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ Display Results          │
    │ - Patient Name           │
    │ - Phone Number           │
    │ - Past Encounters Count  │
    │ - Last Visit Date        │
    └────────┬─────────────────┘
             │ Click Patient
             ▼
    ┌──────────────────────────┐
    │ VIEW PATIENT HISTORY     │
    │ - All Encounters         │
    │ - Investigation Results  │
    │ - Reminders              │
    │ - Medications            │
    │ - Allergies              │
    └────────┬─────────────────┘
             │ Open Encounter
             ▼
    Display Encounter Details
    (9 sections with transcripts)
```

---

## 🔔 Investigation & Reminder Flow

```
INVESTIGATION ORDER
┌─────────────────────────────────┐
│ Doctor Orders Investigation     │
│ - Test Name                     │
│ - Description                   │
│ - Expected Report Date          │
└────────────┬────────────────────┘
             │ Save
             ▼
    Create Investigation Record
    (investigations table)
             │
             ▼
    ┌──────────────────────────┐
    │ Expected Date Reached?   │
    │ Status = "report-awaited"│
    └────────┬─────────────────┘
             │ Auto-Create Reminder
             ▼
    ┌──────────────────────────┐
    │ CREATE REMINDER          │
    │ - Type: report-awaited   │
    │ - Date: expected date    │
    │ - Time: 09:00 AM         │
    │ - Link: investigation ID │
    └────────┬─────────────────┘
             │
             ▼
    Add to Reminders Table
             │
             ▼
    ┌──────────────────────────┐
    │ SCHEDULED NOTIFICATION   │
    │ At scheduled time:       │
    │ "Report awaited for..."  │
    │ [Completed] [Delete]     │
    └─────────────────────────┘
```

---

## 📱 Mobile App Architecture

```
REACT NATIVE / EXPO
┌─────────────────────────────────────────────┐
│  Navigation Stack                           │
│  ┌───────────────────────────────────────┐  │
│  │ Tab Navigation (4 Tabs)               │  │
│  ├───────────────────────────────────────┤  │
│  │ Tab 1: Dashboard                      │  │
│  │ ├─ Quick Actions                      │  │
│  │ ├─ Recent Patients                    │  │
│  │ └─ Patient Count                      │  │
│  │                                       │  │
│  │ Tab 2: Patients                       │  │
│  │ ├─ New Patient Form                   │  │
│  │ ├─ Patient List                       │  │
│  │ └─ Patient Details                    │  │
│  │                                       │  │
│  │ Tab 3: Reminders                      │  │
│  │ ├─ Active Reminders                   │  │
│  │ ├─ Completed Reminders                │  │
│  │ └─ Create New Reminder                │  │
│  │                                       │  │
│  │ Tab 4: Settings                       │  │
│  │ ├─ Profile                            │  │
│  │ ├─ Notifications                      │  │
│  │ └─ Logout                             │  │
│  │                                       │  │
│  │ Stack: Recording Flow                 │  │
│  │ ├─ Encounter Recorder                 │  │
│  │ ├─ Audio Recording (native)           │  │
│  │ └─ Transcription (offline/online)     │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
           │
           ├─► API Client (Axios)
           ├─► Supabase Client
           ├─► Audio Recording (Expo Audio)
           ├─► Local Storage (AsyncStorage)
           ├─► Notifications (Expo Notifications)
           └─► Sync Manager (offline → online)
```

---

## 🗄️ Database Schema Relationships

```
PATIENTS (1)
│
├─── (1:N) ──────────────────► ENCOUNTERS (N)
│                              │
│                              ├─ greeting (section)
│                              ├─ complaints (section[])
│                              ├─ history (section)
│                              ├─ examination (section)
│                              ├─ diagnosis (section)
│                              ├─ treatment_plan (section)
│                              └─────┬─────────────┐
│                                    │             │
│                        (1:N)       │             │
│                                    ▼             ▼
│                            INVESTIGATIONS   PHYSIOTHERAPY_PLANS
│                            │                │
│                            ├─ test_name    ├─ duration
│                            ├─ status       ├─ frequency
│                            ├─ result_date  └─ progress_notes
│                            └─────┬───────────────┬─────────┐
│                                  │               │         │
│                        (1:1)     │               │         │
│                                  ▼               │         │
│                            REMINDERS ◄──────────┘         │
│                            │                              │
│                            ├─ reminder_type              │
│                            │  • report-awaited           │
│                            │  • followup-visit ◄─────────┤
│                            │  • physio-session ◄─────────┘
│                            │  • custom
│                            ├─ scheduled_date
│                            ├─ status
│                            └─ notification_sent


DOCTORS (1)
│
└─── (1:N) ──────────────────► ENCOUNTERS (N)
                               (doctor_id foreign key)


STORAGE BUCKETS (File URLs stored in DB)
│
├─ encounter-recordings/
│  └─ {encounter_id}/{section_id}.webm
│
├─ investigation-reports/
│  └─ {investigation_id}/{filename}.pdf
│
└─ physiotherapy-files/
   └─ {physiotherapy_plan_id}/{filename}.xlsx
```

---

## 🔐 Authentication & Authorization Flow

```
UNAUTHENTICATED
│
├─► Landing Page
│   └─ Login / Register
│
AUTHENTICATION
│
├─ Email + Password (Supabase Auth)
├─ OR Phone OTP (Supabase Auth)
│
AUTH FLOW
│
├─► Create Session
├─► Store JWT Token
├─► Redirect to Dashboard
│
AUTHORIZED REQUESTS
│
All API calls include:
Authorization: Bearer <JWT_TOKEN>
│
VERIFY TOKEN
│
├─ Check signature
├─ Check expiration
├─ Check user role
├─ Apply RLS policies
│
ALLOWED
│
├─ Read own patient records
├─ Create encounters
├─ Create/update reminders
├─ Search patients
│
NOT ALLOWED
│
├─ Read other doctors' data
├─ Delete patients without permission
├─ Modify past encounters (audit trail)
```

---

## 📊 Data Flow - Encounter Recording to Database

```
USER INTERACTION
│
├─► Doctor speaks into microphone
│
AUDIO CAPTURE (Web Audio API)
│
├─► MediaRecorder starts
├─► Audio chunks buffered
├─► User hits "Stop Recording"
│
PROCESSING
│
├─► Blob creation from chunks
├─► Whisper API call
│   └─► Returns transcript
├─► User reviews/edits transcript
│
SAVE TO DATABASE
│
├─► Create EncounterSection object
│   ├─ id: UUID
│   ├─ type: "complaints" (etc)
│   ├─ speaker: "doctor" or "patient"
│   ├─ timestamp: ISO string
│   ├─ recordingUrl: URL to Supabase Storage
│   ├─ transcript: text from Whisper
│   └─ duration: seconds
│
├─► Upload audio blob to Supabase Storage
│   └─► Get signed URL
│
├─► Insert into encounters table
│   └─► All 9 sections linked
│
COMPLETE
│
└─► Encounter saved with all data
    Ready for review/follow-up
```

---

## 🔄 Offline Sync Flow (Mobile)

```
OFFLINE MODE
│
├─► User creates encounter (no internet)
│
LOCAL STORAGE
│
├─► Save to SQLite/AsyncStorage
├─► Queue for sync
│
STATUS: "SYNCING"
│
├─ Auto-save locally
├─ Show "Offline" indicator
├─ Disable server features
│
ONLINE DETECTED
│
├─► Network connectivity returns
│
SYNC PROCESS
│
├─► Get queued items from local DB
├─► POST to API endpoints
├─► Handle conflicts
├─► Update local records
│
SUCCESS
│
├─► Clear local queue
├─► Update status: "SYNCED"
├─► Show success notification
│
ERROR HANDLING
│
├─► Retry logic (exponential backoff)
├─► Manual sync button
├─► Conflict resolution UI
└─► Data preserved locally
```

---

## 📈 Performance & Scalability

```
DATABASE OPTIMIZATION
│
├─ Indexes on:
│  ├─ patients(phone_number)
│  ├─ encounters(patient_id, date)
│  ├─ investigations(encounter_id, status)
│  ├─ reminders(patient_id, status)
│  └─ reminders(reminder_date_time)
│
├─ Connection Pooling (Supabase)
│
CACHING STRATEGY
│
├─ Patient list (5 min cache)
├─ Encounter details (10 min)
├─ Reminders (2 min - real-time)
│
API OPTIMIZATION
│
├─ Pagination (20 items/page)
├─ Lazy loading
├─ Selective field retrieval
├─ Compression (gzip)
│
FRONTEND OPTIMIZATION
│
├─ Code splitting
├─ Image optimization
├─ Component memoization
├─ React Query for data management
│
EXPECTED SCALE
│
├─ Web: 10,000+ concurrent users
├─ Mobile: 5,000+ concurrent users
├─ Database: 10M+ patient records
├─ Storage: 100TB+ audio files (with cleanup)
```

---

## 🚀 Deployment Architecture

```
DEVELOPMENT
│
├─ localhost:3000
├─ Supabase dev project
└─ OpenAI sandbox API

STAGING
│
├─ staging.medivoice.app
├─ Supabase staging project
├─ OpenAI staging keys
└─ 99.5% uptime SLA

PRODUCTION
│
├─ medivoice.app
├─ Supabase production
│  └─ Daily backups
│  └─ Replication (multi-region)
├─ OpenAI production keys
│  └─ Rate limiting
│  └─ Cost controls
│
├─ WEB DEPLOYMENT
│  ├─ Vercel (recommended)
│  ├─ Auto-scaling
│  ├─ Edge caching
│  ├─ HTTPS/TLS
│  └─ DDoS protection
│
├─ iOS DEPLOYMENT
│  ├─ Apple App Store
│  ├─ TestFlight beta
│  ├─ Signed builds
│  └─ Push notifications (APNs)
│
├─ ANDROID DEPLOYMENT
│  ├─ Google Play Store
│  ├─ Internal testing
│  ├─ Signed builds
│  └─ Push notifications (FCM)
│
└─ CDN / STORAGE
   ├─ Supabase Storage
   ├─ Cloudflare CDN
   └─ 99.9% uptime
```

---

## 🔐 Security Layers

```
TRANSPORTATION
│
├─ HTTPS/TLS 1.3
├─ Certificate pinning (mobile)
└─ Secure WebSockets

APPLICATION
│
├─ Authentication
│  ├─ JWT tokens
│  ├─ Refresh tokens
│  └─ Session timeout (1 hour)
│
├─ Authorization
│  ├─ Role-based access (RBAC)
│  ├─ Row-level security (RLS)
│  └─ API rate limiting
│
├─ Data Validation
│  ├─ Input sanitization
│  ├─ Type checking (TypeScript)
│  └─ CORS validation

DATABASE
│
├─ Encryption at rest (AES-256)
├─ Encrypted backups
├─ Private networking
├─ Access logging
└─ Audit trails

AUDIT & MONITORING
│
├─ Request logging
├─ Error tracking (Sentry)
├─ Performance monitoring
├─ Intrusion detection
└─ Compliance logging (HIPAA)
```

---

This architecture provides a scalable, secure, and production-ready foundation for MediVoice Records. All components are designed to handle healthcare data safely while providing an excellent user experience.

**Reference this document when:**
- Planning database queries
- Integrating new features
- Scaling the application
- Implementing security measures
- Debugging data flow issues
