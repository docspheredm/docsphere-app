/**
 * API Route: /api/investigations
 * CRUD operations for medical investigations
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Investigation } from '@/lib/types';

// GET investigations for an encounter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const encounterId = searchParams.get('encounterId');
    const status = searchParams.get('status');

    // TODO: Query from Supabase/Firebase
    // const investigations = await db.investigations.list({ encounterId, status });

    const investigations: Investigation[] = [];

    return NextResponse.json({ success: true, data: investigations });
  } catch (error) {
    console.error('GET /api/investigations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investigations' },
      { status: 500 }
    );
  }
}

// POST create new investigation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      encounterId,
      orderedBy,
      testName,
      testDescription,
      expectedReportDate,
    } = body;

    const newInvestigation: Investigation = {
      id: crypto.randomUUID(),
      encounterId,
      orderedBy,
      testName,
      testDescription,
      orderedDate: new Date().toISOString(),
      expectedReportDate,
      status: 'ordered',
    };

    // TODO: Save to Supabase/Firebase
    // await db.investigations.create(newInvestigation);

    // TODO: If "report-awaited", create a reminder automatically
    // if (status === 'report-awaited' && expectedReportDate) {
    //   await createReminder({
    //     investigationId: newInvestigation.id,
    //     reminderType: 'report-awaited',
    //     title: `Report awaited for ${testName}`,
    //     scheduledDate: expectedReportDate,
    //     scheduledTime: '09:00',
    //   });
    // }

    return NextResponse.json(
      { success: true, data: newInvestigation },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/investigations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create investigation' },
      { status: 500 }
    );
  }
}
