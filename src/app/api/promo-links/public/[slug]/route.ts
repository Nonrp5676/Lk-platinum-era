import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoLinks, promoPlatforms, releases } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;

    const [link] = await db.select({
      id: promoLinks.id,
      releaseTitle: releases.title,
      releaseArtist: releases.mainArtist,
      releaseCover: releases.coverUrl,
    }).from(promoLinks)
      .innerJoin(releases, eq(promoLinks.releaseId, releases.id))
      .where(eq(promoLinks.slug, slug))
      .limit(1);

    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // increment views asynchronously
    db.update(promoLinks).set({ viewsCount: sql`views_count + 1` }).where(eq(promoLinks.id, link.id)).execute().catch(()=>{});

    const platforms = await db.select().from(promoPlatforms).where(eq(promoPlatforms.promoLinkId, link.id));

    return NextResponse.json({ link, platforms });
  } catch(e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
