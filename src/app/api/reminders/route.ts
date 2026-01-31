/**
 * API Route: /api/reminders
 * CRUD operations for medical reminders
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MedicalReminder } from '@/lib/types';

// GET all reminders (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'completed', etc.
    const patientId = searchParams.get('patientId');

    // TODO: Query from Supabase/Firebase with filters
    // const reminders = await db.reminders.list({ status, patientId });

    const reminders: MedicalReminder[] = [];

    return NextResponse.json({ success: true, data: reminders });
  } catch (error) {
    console.error('GET /api/reminders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// POST create new reminder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      encounterId,
      investigationId,
      reminderType,
      title,
      description,
      scheduledDate,
      scheduledTime,
    } = body;

    const scheduledDateTime = `${scheduledDate}T${scheduledTime}`;

    const newReminder: MedicalReminder = {
      id: crypto.randomUUID(),
      patientId,
      encounterId,
      investigationId,
      reminderType,
      title,
      description,
      scheduledDate,
      scheduledTime,
      reminderDateTime: scheduledDateTime,
      status: 'active',
      createdAt: new Date().toISOString(),
      notificationSent: false,
    };

    // TODO: Save to Supabase/Firebase
    // await db.reminders.create(newReminder);

    // TODO: Schedule notification (if using push notifications)

    return NextResponse.json(
      { success: true, data: newReminder },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/reminders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}
