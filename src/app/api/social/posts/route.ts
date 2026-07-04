import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artistPosts, artists, postLikes } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq, sql } from 'drizzle-orm';
import { uploadToSupabaseStorage } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.userId || 0;

    const posts = await db.select({
      id: artistPosts.id,
      content: artistPosts.content,
      imageUrl: artistPosts.imageUrl,
      viewsCount: artistPosts.viewsCount,
      createdAt: artistPosts.createdAt,
      artistId: artists.id,
      artistName: artists.artistName,
      name: artists.name,
      username: artists.username,
      uid: artists.uid,
      avatarUrl: artists.avatarUrl,
    }).from(artistPosts)
      .leftJoin(artists, eq(artistPosts.artistId, artists.id))
      .orderBy(desc(artistPosts.createdAt))
      .limit(50);

    // Подсчитываем лайки и проверяем лайкнул ли пользователь
    const enrichedPosts = await Promise.all(posts.map(async (post) => {
      const [{ count }] = await db.select({ count: sql<number>\`count(*)\` }).from(postLikes).where(eq(postLikes.postId, post.id));
      let hasLiked = false;
      if (userId) {
        const [like] = await db.select().from(postLikes).where(sql\`post_id = \${post.id} AND artist_id = \${userId}\`).limit(1);
        hasLiked = !!like;
      }
      return { ...post, likesCount: count, hasLiked };
    }));

    return NextResponse.json({ posts: enrichedPosts });
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
    const content = formData.get('content') as string;
    const file = formData.get('image') as File | null;

    let imageUrl = null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = \`post_\${Date.now()}_\${file.name.replace(/[^a-zA-Z0-9.]/g, '')}\`;
      imageUrl = await uploadToSupabaseStorage(buffer, fileName, file.type, 'avatars');
    }

    await db.insert(artistPosts).values({
      artistId: session.userId,
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
