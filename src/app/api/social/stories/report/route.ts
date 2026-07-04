import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userReports } from '@/db/schema';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { storyId, reason } = await req.json();

    await db.insert(userReports).values({ 
      reporterId: session.userId,
      targetType: 'story',
      targetId: storyId,
      reason: reason || 'Нарушение правил сообщества',
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
