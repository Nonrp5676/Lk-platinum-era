import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { postLikes } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { postId } = await req.json();

    const existing = await db.select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.artistId, session.userId)))
      .limit(1);

    if (existing.length > 0) {
      await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.artistId, session.userId)));
      return NextResponse.json({ liked: false });
    } else {
      await db.insert(postLikes).values({ postId, artistId: session.userId, createdAt: new Date().toISOString() });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
