import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoLinks, promoPlatforms, releases } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const links = await db.select({
      id: promoLinks.id,
      slug: promoLinks.slug,
      viewsCount: promoLinks.viewsCount,
      createdAt: promoLinks.createdAt,
      releaseTitle: releases.title,
      releaseCover: releases.coverUrl,
    }).from(promoLinks)
      .innerJoin(releases, eq(promoLinks.releaseId, releases.id))
      .where(eq(promoLinks.artistId, session.userId))
      .orderBy(desc(promoLinks.createdAt));

    return NextResponse.json({ links });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { releaseId } = await req.json();

    const [release] = await db.select().from(releases).where(eq(releases.id, releaseId)).limit(1);
    if (!release || release.artistId !== session.userId) {
      return NextResponse.json({ error: 'Релиз не найден' }, { status: 404 });
    }

    const slug = Math.random().toString(36).substring(2, 10);

    const [newLink] = await db.insert(promoLinks).values({
      artistId: session.userId,
      releaseId,
      slug,
      createdAt: new Date().toISOString()
    }).returning();

    return NextResponse.json({ success: true, link: newLink });
  } catch(e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
