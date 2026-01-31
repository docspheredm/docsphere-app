/**
 * Follow-up Visits API Route
 * GET: List follow-up visits for a patient
 * POST: Create new follow-up visit
 */

import { FollowupVisit } from '@/lib/types';

// TODO: Replace with Supabase client when ready
let followupVisits: FollowupVisit[] = [];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  const originalEncounterId = searchParams.get('originalEncounterId');
  const followupType = searchParams.get('followupType');

  try {
    let filtered = followupVisits;

    if (patientId) {
      filtered = filtered.filter((v) => v.patientId === patientId);
    }

    if (originalEncounterId) {
      filtered = filtered.filter((v) => v.originalEncounterId === originalEncounterId);
    }

    if (followupType) {
      filtered = filtered.filter((v) => v.followupType === followupType);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.dateOfVisit).getTime() - new Date(a.dateOfVisit).getTime());

    return Response.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching follow-up visits:', error);
    return Response.json(
      { success: false, message: 'Error fetching follow-up visits' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.patientId || !body.originalEncounterId || !body.doctorName || !body.followupType) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const followupVisit: FollowupVisit = {
      ...body,
      id: `followup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dateOfVisit: body.dateOfVisit || new Date().toISOString(),
      status: body.status || 'ongoing',
      followupNumber: body.followupNumber || 1,
      tags: body.tags || [],
    };

    followupVisits.push(followupVisit);

    return Response.json(
      {
        success: true,
        data: followupVisit,
        message: 'Follow-up visit created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating follow-up visit:', error);
    return Response.json(
      { success: false, message: 'Error creating follow-up visit' },
      { status: 500 }
    );
  }
}
