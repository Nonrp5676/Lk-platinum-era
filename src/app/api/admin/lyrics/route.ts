import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { lyricsSubmissions, artists } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const submissions = await db
      .select({
        id: lyricsSubmissions.id,
        artistId: lyricsSubmissions.artistId,
        trackLink: lyricsSubmissions.trackLink,
        status: lyricsSubmissions.status,
        rejectionReason: lyricsSubmissions.rejectionReason,
        submittedAt: lyricsSubmissions.submittedAt,
        reviewedAt: lyricsSubmissions.reviewedAt,
        artistName: artists.name,
        artistEmail: artists.email,
      })
      .from(lyricsSubmissions)
      .leftJoin(artists, eq(lyricsSubmissions.artistId, artists.id))
      .orderBy(desc(lyricsSubmissions.submittedAt));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching lyrics submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}