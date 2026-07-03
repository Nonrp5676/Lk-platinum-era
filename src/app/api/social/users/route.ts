import { NextResponse } from 'next/server';
import { db } from '@/db';
import { artists } from '@/db/schema';
import { desc, eq, ne } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select({
      id: artists.id,
      uid: artists.uid,
      name: artists.name,
      artistName: artists.artistName,
      username: artists.username,
      avatarUrl: artists.avatarUrl,
      bio: artists.bio,
      lastActiveAt: artists.lastActiveAt,
    }).from(artists).where(eq(artists.isApproved, true)).orderBy(desc(artists.createdAt));

    // Fallback username for users who don't have one yet
    const safeList = list.map(a => ({
      ...a,
      username: a.username || a.uid
    }));

    return NextResponse.json({ artists: safeList });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
