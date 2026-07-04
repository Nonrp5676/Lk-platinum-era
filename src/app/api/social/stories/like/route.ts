import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { storyLikes, appNotifications, artistStories } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { storyId } = await req.json();

    const existing = await db.select()
      .from(storyLikes)
      .where(and(eq(storyLikes.storyId, storyId), eq(storyLikes.artistId, session.userId)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(storyLikes).values({ storyId, artistId: session.userId, createdAt: new Date().toISOString() });
      
      // Send notification to story owner
      const [story] = await db.select().from(artistStories).where(eq(artistStories.id, storyId)).limit(1);
      if (story && story.artistId !== session.userId) {
        await db.insert(appNotifications).values({
          artistId: story.artistId,
          title: "Новый лайк",
          message: \`\${session.name} лайкнул(а) вашу историю.\`,
          createdAt: new Date().toISOString()
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
