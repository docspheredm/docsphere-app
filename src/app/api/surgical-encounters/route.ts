/**
 * Surgical Encounters API Route
 * GET: List surgical encounters
 * POST: Create new surgical encounter
 */

import { SurgicalEncounter } from '@/lib/types';

// TODO: Replace with Supabase client when ready
let surgicalEncounters: SurgicalEncounter[] = [];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  const status = searchParams.get('status');

  try {
    let filtered = surgicalEncounters;

    if (patientId) {
      filtered = filtered.filter((e) => e.patientId === patientId);
    }

    if (status) {
      filtered = filtered.filter((e) => e.status === status);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Response.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching surgical encounters:', error);
    return Response.json(
      { success: false, message: 'Error fetching surgical encounters' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.patientId || !body.doctorName) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const surgicalEncounter: SurgicalEncounter = {
      ...body,
      id: `surg-enc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: body.status || 'pre-surgical',
      surgeryCompleted: body.surgeryCompleted || false,
    };

    surgicalEncounters.push(surgicalEncounter);

    return Response.json(
      {
        success: true,
        data: surgicalEncounter,
        message: 'Surgical encounter created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating surgical encounter:', error);
    return Response.json(
      { success: false, message: 'Error creating surgical encounter' },
      { status: 500 }
    );
  }
}
