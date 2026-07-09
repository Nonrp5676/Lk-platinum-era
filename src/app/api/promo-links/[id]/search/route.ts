import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promoLinks, promoPlatforms } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const linkId = parseInt(params.id);

    const [link] = await db.select().from(promoLinks).where(and(eq(promoLinks.id, linkId), eq(promoLinks.artistId, session.userId))).limit(1);
    if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Simulate UPC lookup delay
    await new Promise(r => setTimeout(r, 2000));

    const existing = await db.select().from(promoPlatforms).where(eq(promoPlatforms.promoLinkId, linkId));
    const existingPlats = existing.map(e => e.platform);

    const mockPlatforms = [
      { p: 'apple_music', u: 'https://music.apple.com' },
      { p: 'spotify', u: 'https://spotify.com' },
      { p: 'yandex', u: 'https://music.yandex.ru' },
      { p: 'vk', u: 'https://vk.com/audio' }
    ];

    let addedCount = 0;
    for (const mp of mockPlatforms) {
      if (!existingPlats.includes(mp.p)) {
        await db.insert(promoPlatforms).values({
          promoLinkId: linkId,
          platform: mp.p,
          url: mp.u
        });
        addedCount++;
      }
    }

    return NextResponse.json({ success: true, addedCount });
  } catch(e) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
