# MediVoice Records - Medical Voice-to-Text Encounter Recording System

A comprehensive platform for doctors to record and transcribe patient-doctor conversations in real-time, manage medical encounters, set reminders for investigations and follow-ups, and maintain searchable patient records.

## Features

### Core Functionality

1. **Patient Management**
   - Create new patient records with demographics (name, age, phone, email, gender)
   - Search patients by name or phone number
   - View patient history and past encounters
   - Edit patient information

2. **Encounter Recording**
   - Real-time voice recording with speaker identification (Doctor/Patient)
   - Step-by-step medical encounter structure:
     - 👋 Greeting
     - 😣 Patient Complaints
     - 📋 History of Present Complaints
     - 🔍 Examination Findings
     - 🩺 Diagnosis
     - 💊 Treatment Plan
     - 🧬 Investigations Ordered
     - 🏃 Physiotherapy Plan
     - 📅 Follow-up Schedule
   - Automatic timestamp and speaker labels
   - Audio blob storage and transcription (Whisper API integration ready)
   - Manual transcript/notes editing

3. **Investigation Tracking**
   - Order investigations with test name and description
   - Set expected report dates
   - Automatic reminder creation for "report awaited"
   - Track investigation status (ordered → report-awaited → completed)
   - Upload and attach investigation results
   - Quick reference from encounter record

4. **Reminder System**
   - Automatic reminder creation for:
     - Report awaited dates
     - Follow-up visits
     - Physiotherapy sessions
   - Calendar-based date/time selection
   - Notification system (desktop & mobile)
   - Mark reminders as completed
   - Delete reminders after completion
   - View all active and completed reminders

5. **Physiotherapy Plan**
   - Document physiotherapy recommendations
   - Set duration and frequency
   - Attach progress notes
   - Export as Excel file
   - Track physiotherapy sessions

6. **Search & Recovery**
   - Search by patient name or phone number
   - View complete encounter history
   - Access past encounter details
   - Edit and update encounter records

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── patients/route.ts           # Patient CRUD endpoints
│   │   ├── encounters/route.ts         # Encounter management
│   │   ├── reminders/route.ts          # Reminder operations
│   │   └── investigations/route.ts     # Investigation tracking
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                        # Main dashboard entry
├── components/
│   ├── app/
│   │   ├── medical-dashboard.tsx       # Main tabbed dashboard
│   │   ├── encounter-recorder.tsx      # Recording interface
│   │   ├── app-header.tsx
│   │   └── ...other existing components
│   └── ui/
│       └── ...shadcn UI components
├── hooks/
│   └── ...existing hooks
├── lib/
│   ├── types.ts                        # Medical data models
│   └── ...utilities
└── ai/
    └── ...existing AI integration
```

## Data Models

### Patient
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  phoneNumber: string;
  email?: string;
  gender?: 'M' | 'F' | 'Other';
  medicalHistory?: string[];
  allergies?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Encounter (Medical Record)
```typescript
{
  id: string;
  patientId: string;
  doctorName: string;
  doctorId?: string;
  dateOfEncounter: string;
  
  greeting?: EncounterSection;
  complaints?: EncounterSection[];
  historyOfPresentComplaints?: EncounterSection;
  examinationFindings?: EncounterSection;
  diagnosis?: EncounterSection;
  treatmentPlan?: EncounterSection;
  
  investigations?: Investigation[];
  physiotherapyPlan?: PhysiotherapyPlan;
  
  followupDate?: string;
  followupNotes?: string;
  status: 'draft' | 'completed' | 'reviewed';
  createdAt: string;
  updatedAt: string;
}
```

### Investigation
```typescript
{
  id: string;
  encounterId: string;
  testName: string;
  orderedDate: string;
  expectedReportDate?: string;
  status: 'ordered' | 'report-awaited' | 'completed';
  result?: string;
  reportFile?: string;
  notes?: string;
}
```

### Medical Reminder
```typescript
{
  id: string;
  patientId?: string;
  encounterId?: string;
  investigationId?: string;
  reminderType: 'report-awaited' | 'followup-visit' | 'physio-session' | 'custom';
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime: string;
  reminderDateTime: string;
  status: 'active' | 'completed' | 'dismissed';
  notificationSent: boolean;
}
```

## API Routes

### Patients
- `GET /api/patients` - List all patients (with search/filter)
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details
- `PATCH /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

### Encounters
- `GET /api/encounters?patientId=X` - Get encounters for patient
- `POST /api/encounters` - Create new encounter
- `GET /api/encounters/[id]` - Get encounter details
- `PATCH /api/encounters/[id]` - Update encounter
- `DELETE /api/encounters/[id]` - Delete encounter

### Investigations
- `GET /api/investigations?encounterId=X` - List investigations
- `POST /api/investigations` - Create investigation
- `PATCH /api/investigations/[id]` - Update investigation
- `DELETE /api/investigations/[id]` - Delete investigation

### Reminders
- `GET /api/reminders` - List reminders (with filters)
- `POST /api/reminders` - Create reminder
- `PATCH /api/reminders/[id]` - Update reminder status
- `DELETE /api/reminders/[id]` - Delete reminder

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Microphone access (for audio recording)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd VoRe-Docsphere

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure backend (Supabase or Firebase)
# - Create project in Supabase or Firebase
# - Set API keys in .env.local
# - Run database migrations
```

### Environment Variables

Create `.env.local`:

```bash
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# Speech-to-Text (Whisper API)
OPENAI_API_KEY=sk_...

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# OR Firebase
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

# Push Notifications (optional)
VAPID_PUBLIC_KEY=...
```

### Development

```bash
# Start dev server
npm run dev

# Open in browser
# http://localhost:3000

# In another terminal, start AI Genkit (if using)
npm run genkit:dev
```

### Building for Production

```bash
# Type check
npm run typecheck

# Build
npm run build

# Start production server
npm start
```

## Database Setup (Supabase Example)

### Tables

1. **patients**
   - id (UUID)
   - first_name (text)
   - last_name (text)
   - age (int)
   - phone_number (text, unique)
   - email (text)
   - gender (text)
   - medical_history (text[])
   - allergies (text[])
   - created_at (timestamp)
   - updated_at (timestamp)

2. **encounters**
   - id (UUID)
   - patient_id (UUID, FK)
   - doctor_name (text)
   - doctor_id (UUID)
   - date_of_encounter (date)
   - greeting (jsonb)
   - complaints (jsonb[])
   - history_of_present_complaints (jsonb)
   - examination_findings (jsonb)
   - diagnosis (jsonb)
   - treatment_plan (jsonb)
   - follow_up_date (date)
   - follow_up_notes (text)
   - general_notes (text)
   - status (enum: draft, completed, reviewed)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **investigations**
   - id (UUID)
   - encounter_id (UUID, FK)
   - ordered_by (text)
   - test_name (text)
   - test_description (text)
   - ordered_date (timestamp)
   - expected_report_date (timestamp)
   - status (enum: ordered, report-awaited, completed)
   - result (text)
   - report_file (text, URL)
   - result_date (timestamp)
   - notes (text)

4. **reminders**
   - id (UUID)
   - patient_id (UUID, FK, nullable)
   - encounter_id (UUID, FK, nullable)
   - investigation_id (UUID, FK, nullable)
   - reminder_type (enum: report-awaited, followup-visit, physio-session, custom)
   - title (text)
   - description (text)
   - scheduled_date (date)
   - scheduled_time (time)
   - reminder_date_time (timestamp)
   - status (enum: active, completed, dismissed)
   - notification_sent (boolean)
   - notification_sent_at (timestamp)
   - created_at (timestamp)
   - completed_at (timestamp)

5. **physiotherapy_plans**
   - id (UUID)
   - encounter_id (UUID, FK)
   - plan_description (text)
   - duration (text)
   - frequency (text)
   - progress_notes (text)
   - attached_file (text, URL)
   - start_date (timestamp)
   - expected_end_date (timestamp)

## Integration with Whisper API

For audio transcription, integrate OpenAI's Whisper API:

```typescript
// src/lib/transcription.ts
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.text;
}
```

## Push Notifications (Web & Mobile)

### Web Notifications
```typescript
// Request permission on app load
if ('Notification' in window) {
  Notification.requestPermission();
}

// Send notification
function sendNotification(title: string, options: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}
```

### Mobile (Expo)
```bash
# Install
npm install expo-notifications

# Configure in app.json
{
  "plugins": ["expo-notifications"]
}
```

## Cross-Platform Deployment

### Web (Next.js)
- Deploy to Vercel, Netlify, or self-hosted server
- PWA enabled for offline support

### iOS
```bash
# Using Expo
eas build --platform ios

# Or with React Native + Xcode
npx react-native build-ios
```

### Android
```bash
# Using Expo
eas build --platform android

# Or with React Native
npx react-native build-android
```

### Desktop (Electron)
```bash
# Install Electron
npm install electron --save-dev

# Create main.js for Electron entry point
# Build with: npm run build:electron
```

## App Store & Play Store Submission

### Apple App Store
1. Create Apple Developer account
2. Generate certificates and provisioning profiles
3. Build signed IPA
4. Submit via App Store Connect
5. Compliance: HIPAA for healthcare data

### Google Play Store
1. Create Google Play developer account
2. Generate signed APK/AAB
3. Upload to Play Console
4. Set privacy policy (HIPAA compliance)

## Security Considerations

1. **HIPAA Compliance** (if handling US patient data)
   - Encrypt data in transit (HTTPS/TLS)
   - Encrypt data at rest
   - Access logging
   - User authentication
   - Business Associate Agreement (BAA)

2. **Data Privacy**
   - GDPR compliance for EU users
   - Secure patient data storage
   - Regular security audits
   - Incident response plan

3. **Authentication**
   - Doctor/user authentication
   - Role-based access control (RBAC)
   - API key protection

## Testing

```bash
# Unit tests
npm test

# E2E tests (if configured)
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Troubleshooting

### Microphone Access Issues
- Check browser permissions for microphone
- Test at: chrome://settings/content/microphone
- Grant permission to localhost:3000

### Audio Recording Not Working
- Ensure HTTPS or localhost (required for Web Audio API)
- Check browser console for errors
- Verify MediaRecorder support

### Transcription Delays
- Monitor OpenAI API rate limits
- Implement request queueing for large files
- Cache results for identical audio segments

## Future Enhancements

1. **AI-Powered Features**
   - Auto-summarization of encounters
   - ICD-10 code suggestions
   - Drug interaction checking
   - Automated follow-up scheduling

2. **Analytics Dashboard**
   - Patient visit frequency
   - Common diagnoses
   - Investigation ordering patterns
   - Treatment outcomes

3. **Telehealth Integration**
   - Video consultation recording
   - Screen sharing for test results
   - Remote patient monitoring

4. **Integrations**
   - EHR/EMR system APIs
   - Lab result imports
   - Insurance processing
   - Prescription systems

5. **Mobile-First Features**
   - Offline recording and sync
   - Biometric authentication
   - Voice commands
   - Push notifications

## Support & Documentation

- Full API documentation: `/docs/api`
- User guide: `/docs/user-guide.md`
- Developer guide: `/docs/developer-guide.md`
- Video tutorials: Check `/docs/videos`

## License

Proprietary - All rights reserved

## Contact

For support, email: support@medivoice.app

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Status:** Development/Beta
