import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoLinks, promoPlatforms, releases } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const linkId = parseInt(params.id);

    const [link] = await db.select({
      id: promoLinks.id,
      slug: promoLinks.slug,
      viewsCount: promoLinks.viewsCount,
      releaseTitle: releases.title,
      releaseArtist: releases.mainArtist,
      releaseCover: releases.coverUrl,
    }).from(promoLinks)
      .innerJoin(releases, eq(promoLinks.releaseId, releases.id))
      .where(and(eq(promoLinks.id, linkId), eq(promoLinks.artistId, session.userId)))
      .limit(1);

    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const platforms = await db.select().from(promoPlatforms).where(eq(promoPlatforms.promoLinkId, linkId));

    return NextResponse.json({ link, platforms });
  } catch(e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const linkId = parseInt(params.id);
    const { platform, url } = await req.json();

    // Check duplicate
    const existing = await db.select().from(promoPlatforms).where(and(eq(promoPlatforms.promoLinkId, linkId), eq(promoPlatforms.platform, platform)));
    if (existing.length > 0) return NextResponse.json({ error: 'Платформа уже добавлена' }, { status: 400 });

    await db.insert(promoPlatforms).values({
      promoLinkId: linkId,
      platform,
      url
    });

    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const linkId = parseInt(params.id);
    
    // verify ownership
    const [link] = await db.select().from(promoLinks).where(and(eq(promoLinks.id, linkId), eq(promoLinks.artistId, session.userId))).limit(1);
    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.delete(promoPlatforms).where(eq(promoPlatforms.promoLinkId, linkId));
    await db.delete(promoLinks).where(eq(promoLinks.id, linkId));

    return NextResponse.json({ success: true });
  } catch(e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
