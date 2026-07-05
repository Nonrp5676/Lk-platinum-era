import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { storyViews, storyLikes, artists } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const storyId = parseInt(params.id);
    
    const views = await db.select({
      artistId: artists.id, 
      name: artists.name, 
      artistName: artists.artistName, 
      username: artists.username,
      avatarUrl: artists.avatarUrl,
      isVerified: artists.contractSigned
    }).from(storyViews).innerJoin(artists, eq(storyViews.artistId, artists.id)).where(eq(storyViews.storyId, storyId));
    
    const likes = await db.select({
      artistId: artists.id
    }).from(storyLikes).where(eq(storyLikes.storyId, storyId));

    return NextResponse.json({ views, likes });
  } catch(e) { 
    return NextResponse.json({ error: 'Error' }, { status: 500 }); 
  }
}
