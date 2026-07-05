import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artistStories, artists } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, gt, desc } from 'drizzle-orm';
import { uploadToSupabaseStorage } from '@/lib/supabase';

export async function GET() {
  try {
    const now = new Date().toISOString();
    const rawStories = await db.select({
      id: artistStories.id,
      mediaUrl: artistStories.mediaUrl,
      mediaType: artistStories.mediaType,
      textOverlay: artistStories.textOverlay,
      linkUrl: artistStories.linkUrl,
      createdAt: artistStories.createdAt,
      expiresAt: artistStories.expiresAt,
      artistId: artists.id,
      artistName: artists.artistName,
      name: artists.name,
      username: artists.username,
      uid: artists.uid,
      avatarUrl: artists.avatarUrl,
      isVerified: artists.contractSigned,
    })
    .from(artistStories)
    .leftJoin(artists, eq(artistStories.artistId, artists.id))
    .where(gt(artistStories.expiresAt, now))
    .orderBy(desc(artistStories.createdAt));

    // Group by artist
    const grouped = rawStories.reduce((acc: any, story) => {
      const aId = story.artistId;
      if (!acc[aId]) {
        acc[aId] = {
          artistId: aId,
          artistName: story.artistName || story.name,
          username: story.username || story.uid,
          avatarUrl: story.avatarUrl,
          isVerified: story.isVerified,
          stories: []
        };
      }
      acc[aId].stories.push(story);
      return acc;
    }, {});

    return NextResponse.json({ grouped: Object.values(grouped) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const textOverlay = formData.get('textOverlay') as string || null;
    const linkUrl = formData.get('linkUrl') as string || null;

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `story_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const mediaUrl = await uploadToSupabaseStorage(buffer, fileName, file.type, 'avatars');
    
    const isVideo = file.type.startsWith('video/');
    
    // Expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await db.insert(artistStories).values({
      artistId: session.userId,
      mediaUrl,
      mediaType: isVideo ? 'video' : 'image',
      textOverlay,
      linkUrl,
      createdAt: new Date().toISOString(),
      expiresAt
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
