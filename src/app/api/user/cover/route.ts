import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/db';
import { artists } from '@/db/schema';
import { eq } from 'drizzle-orm';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Допустимые форматы: JPG, PNG, WebP' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Максимальный размер: 10 МБ' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = \`\${session.userId}/cover_\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}.\${ext}\`;

    const arrayBuffer = await file.arrayBuffer();
    const uploadRes = await fetch(\`\${SUPABASE_URL}/storage/v1/object/avatars/\${fileName}\`, {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${SUPABASE_KEY}\`,
        'Content-Type': file.type,
      },
      body: arrayBuffer,
    });

    if (!uploadRes.ok) {
      return NextResponse.json({ error: 'Ошибка загрузки файла' }, { status: 500 });
    }

    const publicUrl = \`\${SUPABASE_URL}/storage/v1/object/public/avatars/\${fileName}\`;

    await db
      .update(artists)
      .set({ coverUrl: publicUrl })
      .where(eq(artists.id, session.userId));

    return NextResponse.json({ success: true, coverUrl: publicUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при загрузке обложки' }, { status: 500 });
  }
}
