import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { storyViews } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { storyId } = await req.json();
    
    const existing = await db.select().from(storyViews).where(and(eq(storyViews.storyId, storyId), eq(storyViews.artistId, session.userId))).limit(1);
    if (existing.length === 0) {
      await db.insert(storyViews).values({ storyId, artistId: session.userId, createdAt: new Date().toISOString() });
    }
    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
