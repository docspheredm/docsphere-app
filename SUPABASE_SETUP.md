# Supabase Setup Guide for MediVoice Records

This guide walks through setting up Supabase as the backend for MediVoice Records.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project name:** medivoice-app
   - **Database password:** (Create strong password, save it!)
   - **Region:** Choose closest to your users
5. Click "Create new project"
6. Wait for project initialization (3-5 minutes)

## Step 2: Configure Environment Variables

Once your project is created:

1. Go to **Settings → API**
2. Copy the following to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

3. Also set your OpenAI key:
```bash
OPENAI_API_KEY=<your_openai_api_key>
```

## Step 3: Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run:

```sql
-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  email TEXT,
  gender TEXT CHECK (gender IN ('M', 'F', 'Other')),
  medical_history TEXT[],
  allergies TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create encounters table
CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  doctor_id UUID,
  date_of_encounter DATE NOT NULL,
  greeting JSONB,
  complaints JSONB[],
  history_of_present_complaints JSONB,
  examination_findings JSONB,
  diagnosis JSONB,
  treatment_plan JSONB,
  follow_up_date DATE,
  follow_up_notes TEXT,
  general_notes TEXT,
  status TEXT CHECK (status IN ('draft', 'completed', 'reviewed')) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create investigations table
CREATE TABLE investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  ordered_by TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_description TEXT,
  ordered_date TIMESTAMP DEFAULT NOW(),
  expected_report_date TIMESTAMP,
  status TEXT CHECK (status IN ('ordered', 'report-awaited', 'completed')) DEFAULT 'ordered',
  result TEXT,
  report_file TEXT,
  result_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
  investigation_id UUID REFERENCES investigations(id) ON DELETE SET NULL,
  reminder_type TEXT CHECK (reminder_type IN ('report-awaited', 'followup-visit', 'physio-session', 'custom')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  reminder_date_time TIMESTAMP NOT NULL,
  status TEXT CHECK (status IN ('active', 'completed', 'dismissed')) DEFAULT 'active',
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create physiotherapy_plans table
CREATE TABLE physiotherapy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID NOT NULL REFERENCES encounters(id) ON DELETE CASCADE,
  plan_description TEXT NOT NULL,
  duration TEXT,
  frequency TEXT,
  progress_notes TEXT,
  attached_file TEXT,
  start_date TIMESTAMP DEFAULT NOW(),
  expected_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_patients_phone ON patients(phone_number);
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_date ON encounters(date_of_encounter);
CREATE INDEX idx_investigations_encounter ON investigations(encounter_id);
CREATE INDEX idx_investigations_status ON investigations(status);
CREATE INDEX idx_reminders_patient ON reminders(patient_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_datetime ON reminders(reminder_date_time);
```

## Step 4: Enable Row Level Security (RLS)

This restricts data access based on user roles:

```sql
-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE physiotherapy_plans ENABLE ROW LEVEL SECURITY;

-- Create doctor role
CREATE ROLE "doctor" NOINHERIT;

-- For now, allow all authenticated users to see all data
-- In production, add more restrictive policies
CREATE POLICY "doctors_can_access_patients"
  ON patients
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "doctors_can_access_encounters"
  ON encounters
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "doctors_can_access_investigations"
  ON investigations
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "doctors_can_access_reminders"
  ON reminders
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "doctors_can_access_physio"
  ON physiotherapy_plans
  USING (TRUE)
  WITH CHECK (TRUE);
```

## Step 5: Set Up Storage for Audio & Files

Go to **Storage** in Supabase:

1. Create new bucket: `encounter-recordings`
   - Make it **Private**
   - Enable all file types

2. Create new bucket: `investigation-reports`
   - Make it **Private**
   - Enable all file types

3. Create new bucket: `physiotherapy-files`
   - Make it **Private**
   - Enable: `*.xlsx, *.xls, *.pdf`

## Step 6: Create Supabase Client in Your App

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations (API routes)
export const createServerSupabase = (token: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
```

## Step 7: Update API Routes to Use Supabase

Example - Update `/api/patients/route.ts`:

```typescript
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase.from('patients').select('*');

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(20);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, age, phone_number, email, gender } = body;

    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          first_name,
          last_name,
          age,
          phone_number,
          email,
          gender,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
```

## Step 8: Install Supabase Client Library

```bash
npm install @supabase/supabase-js
```

## Step 9: Test Connection

Add a test component to verify connection:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseTest() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('patients').select('count');
        if (error) throw error;
        setStatus('✅ Connected to Supabase');
      } catch (err) {
        setStatus('❌ Connection failed: ' + JSON.stringify(err));
      }
    };

    testConnection();
  }, []);

  return <div className="p-4 bg-blue-100 rounded">{status}</div>;
}
```

## Step 10: Deploy to Production

### Prepare for Production:
1. Set strong database password
2. Enable HTTPS only
3. Configure custom domain in Supabase settings
4. Set up regular backups
5. Enable monitoring and logging
6. Configure CORS if needed

### Deploy Next.js to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## Troubleshooting

### Connection Error
```
Error: Invalid URL
```
**Solution:** Check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`

### RLS Policy Errors
```
Error: new row violates row-level security policy for table "patients"
```
**Solution:** Configure RLS policies or disable for development (enable in production!)

### Missing Tables
```
Error: relation "patients" does not exist
```
**Solution:** Run SQL schema creation step (Step 3)

### Rate Limiting
**Solution:** Supabase free tier has limits. Upgrade plan if needed.

## Next Steps

1. ✅ Set up database
2. ✅ Configure environment variables
3. Update all API routes to use Supabase
4. Implement authentication (email/phone)
5. Set up audio file storage
6. Configure automated backups
7. Deploy to production

---

For more help, visit [Supabase Docs](https://supabase.com/docs)
