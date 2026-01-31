/**
 * API Route: /api/reminders/[id]
 * Update and delete specific reminders
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notificationSent } = body;

    // TODO: Update reminder in Supabase/Firebase
    // const updatedReminder = await db.reminders.update(id, { status, notificationSent });

    // Mock response
    const updatedReminder = { id, status, notificationSent, updatedAt: new Date().toISOString() };

    return NextResponse.json({ success: true, data: updatedReminder });
  } catch (error) {
    console.error('PATCH /api/reminders/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // TODO: Delete reminder from Supabase/Firebase
    // await db.reminders.delete(id);

    return NextResponse.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    console.error('DELETE /api/reminders/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
