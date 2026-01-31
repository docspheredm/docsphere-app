/**
 * Surgical Patients API Route
 * GET: List surgical patients
 * POST: Create new surgical patient (transition from OPD)
 */

import { SurgicalPatient } from '@/lib/types';

// TODO: Replace with Supabase client when ready
// For now, using in-memory storage for demonstration

let surgicalPatients: SurgicalPatient[] = [];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  try {
    let filtered = surgicalPatients;

    if (status) {
      filtered = filtered.filter((p) => p.surgicalStatus === status);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(lowerSearch) ||
          p.lastName.toLowerCase().includes(lowerSearch) ||
          p.phoneNumber.includes(lowerSearch)
      );
    }

    return Response.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching surgical patients:', error);
    return Response.json(
      { success: false, message: 'Error fetching surgical patients' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.phoneNumber) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const surgicalPatient: SurgicalPatient = {
      ...body,
      id: `patient-${Date.now()}`,
      surgicalStatus: body.surgicalStatus || 'pre-surgical',
      surgicalEncounters: body.surgicalEncounters || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    surgicalPatients.push(surgicalPatient);

    return Response.json(
      {
        success: true,
        data: surgicalPatient,
        message: 'Surgical patient created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating surgical patient:', error);
    return Response.json(
      { success: false, message: 'Error creating surgical patient' },
      { status: 500 }
    );
  }
}
