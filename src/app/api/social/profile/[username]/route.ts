import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { artistPosts, artists, artistFollows, postLikes } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc, eq, sql, and } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  try {
    const session = await getSession();
    const currentUserId = session?.userId || 0;
    
    // Find artist by username or uid
    let [artist] = await db.select().from(artists).where(eq(artists.username, params.username)).limit(1);
    if (!artist) {
        [artist] = await db.select().from(artists).where(eq(artists.uid, params.username)).limit(1);
    }

    if (!artist) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    // Get followers/following counts
    const [{ followers }] = await db.select({ followers: sql<number>`count(*)` }).from(artistFollows).where(eq(artistFollows.followingId, artist.id));
    const [{ following }] = await db.select({ following: sql<number>`count(*)` }).from(artistFollows).where(eq(artistFollows.followerId, artist.id));
    
    let isFollowing = false;
    if (currentUserId) {
      const [follow] = await db.select().from(artistFollows).where(and(eq(artistFollows.followerId, currentUserId), eq(artistFollows.followingId, artist.id))).limit(1);
      isFollowing = !!follow;
    }

    // Get their posts
    const rawPosts = await db.select().from(artistPosts).where(eq(artistPosts.artistId, artist.id)).orderBy(desc(artistPosts.createdAt)).limit(20);
    
    const posts = await Promise.all(rawPosts.map(async (post) => {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(postLikes).where(eq(postLikes.postId, post.id));
      let hasLiked = false;
      if (currentUserId) {
        const [like] = await db.select().from(postLikes).where(and(eq(postLikes.postId, post.id), eq(postLikes.artistId, currentUserId))).limit(1);
        hasLiked = !!like;
      }
      return { ...post, likesCount: count, hasLiked };
    }));

    return NextResponse.json({
      artist: {
        id: artist.id,
        uid: artist.uid,
        name: artist.name,
        artistName: artist.artistName,
        username: artist.username,
        avatarUrl: artist.avatarUrl,
        bio: artist.bio,
        lastActiveAt: artist.lastActiveAt,
        followersCount: followers,
        followingCount: following,
        isFollowing,
        isMe: currentUserId === artist.id
      },
      posts
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
