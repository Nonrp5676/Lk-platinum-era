import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artistFollows } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { targetId } = await req.json();

    const existing = await db.select()
      .from(artistFollows)
      .where(and(eq(artistFollows.followerId, session.userId), eq(artistFollows.followingId, targetId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(artistFollows).where(and(eq(artistFollows.followerId, session.userId), eq(artistFollows.followingId, targetId)));
      return NextResponse.json({ following: false });
    } else {
      await db.insert(artistFollows).values({ followerId: session.userId, followingId: targetId, createdAt: new Date().toISOString() });
      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
