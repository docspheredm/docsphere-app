/**
 * API Route: /api/encounters
 * CRUD operations for medical encounters
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Encounter } from '@/lib/types';

// GET encounters for a patient
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = searchParams.get('limit') || '20';

    // TODO: Query from Supabase/Firebase
    // const encounters = await db.encounters.list({ patientId, limit });

    const encounters: Encounter[] = [];

    return NextResponse.json({ success: true, data: encounters });
  } catch (error) {
    console.error('GET /api/encounters error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch encounters' },
      { status: 500 }
    );
  }
}

// POST create new encounter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      doctorName,
      doctorId,
      greeting,
      complaints,
      historyOfPresentComplaints,
      examinationFindings,
      diagnosis,
      treatmentPlan,
      investigations,
      physiotherapyPlan,
      followupDate,
      followupNotes,
      generalNotes,
    } = body;

    const newEncounter: Encounter = {
      id: crypto.randomUUID(),
      patientId,
      doctorName,
      doctorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dateOfEncounter: new Date().toISOString().split('T')[0],
      greeting,
      complaints,
      historyOfPresentComplaints,
      examinationFindings,
      diagnosis,
      treatmentPlan,
      investigations,
      physiotherapyPlan,
      followupDate,
      followupNotes,
      generalNotes,
      status: 'draft',
    };

    // TODO: Save to Supabase/Firebase
    // await db.encounters.create(newEncounter);

    return NextResponse.json(
      { success: true, data: newEncounter },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/encounters error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create encounter' },
      { status: 500 }
    );
  }
}
