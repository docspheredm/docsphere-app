/**
 * API Route: /api/patients
 * CRUD operations for patient records
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Patient } from '@/lib/types';

// GET all patients (search, filter, pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search'); // name or phone
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    // TODO: Query from Supabase/Firebase
    // const patients = await db.patients.list({ search, limit, offset });
    
    // Mock response for now
    const patients: Patient[] = [];

    return NextResponse.json({ success: true, data: patients, total: 0 });
  } catch (error) {
    console.error('GET /api/patients error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST create new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, age, phoneNumber, email, gender } = body;

    if (!firstName || !lastName || !age || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newPatient: Patient = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      age,
      phoneNumber,
      email,
      gender,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save to Supabase/Firebase
    // await db.patients.create(newPatient);

    return NextResponse.json(
      { success: true, data: newPatient },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/patients error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}
