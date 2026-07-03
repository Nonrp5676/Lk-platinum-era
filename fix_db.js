const { createClient } = require('@libsql/client');

async function run() {
  const client = createClient({
    url: 'libsql://platinumeramusic-platinumeramusic.aws-ap-northeast-1.turso.io',
    authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODM1MjAxNDYsImdpZCI6IjA5NWRlMzgwLWZkNGYtNDVlYS04MzYzLWI0ODhhMjdhOTQxOCIsImlhdCI6MTc4MjkxNTM0Niwia2lkIjoiRW1LTGpCSGZ0QUlwUHFBeEZxcHV5aGhFY0xHeWFzLUJsR3FoOTRlNFo0USIsInJpZCI6IjlhMThkNmU3LTQ4NGEtNGM1Ni1hYjRjLTI5N2FkNWNmMGMwYyJ9.jswkRdVRLacnyDL4j9YvGWZ3TuN3rmMOg_ZvgACH3pPZDp7NH55qUu1Z4fymwD1CVQ678KS8Qpp-FlC1hJUuAA'
  });

  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS artist_follows (follower_id INTEGER NOT NULL REFERENCES artists(id), following_id INTEGER NOT NULL REFERENCES artists(id), created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS artist_blocks (blocker_id INTEGER NOT NULL REFERENCES artists(id), blocked_id INTEGER NOT NULL REFERENCES artists(id), created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS artist_posts (id INTEGER PRIMARY KEY AUTOINCREMENT, artist_id INTEGER NOT NULL REFERENCES artists(id), content TEXT, image_url TEXT, views_count INTEGER DEFAULT 0 NOT NULL, created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS post_likes (post_id INTEGER NOT NULL REFERENCES artist_posts(id), artist_id INTEGER NOT NULL REFERENCES artists(id), created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS post_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER NOT NULL REFERENCES artist_posts(id), artist_id INTEGER NOT NULL REFERENCES artists(id), content TEXT NOT NULL, created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS artist_stories (id INTEGER PRIMARY KEY AUTOINCREMENT, artist_id INTEGER NOT NULL REFERENCES artists(id), media_url TEXT NOT NULL, media_type TEXT NOT NULL, text_overlay TEXT, link_url TEXT, created_at TEXT NOT NULL, expires_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS story_views (story_id INTEGER NOT NULL REFERENCES artist_stories(id), artist_id INTEGER NOT NULL REFERENCES artists(id), created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS story_likes (story_id INTEGER NOT NULL REFERENCES artist_stories(id), artist_id INTEGER NOT NULL REFERENCES artists(id), created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS user_reports (id INTEGER PRIMARY KEY AUTOINCREMENT, reporter_id INTEGER NOT NULL REFERENCES artists(id), target_type TEXT NOT NULL, target_id INTEGER NOT NULL, reason TEXT NOT NULL, status TEXT DEFAULT 'pending' NOT NULL, created_at TEXT NOT NULL)`);
    await client.execute(`CREATE TABLE IF NOT EXISTS app_notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, artist_id INTEGER NOT NULL REFERENCES artists(id), title TEXT NOT NULL, message TEXT NOT NULL, is_read INTEGER DEFAULT 0 NOT NULL, created_at TEXT NOT NULL)`);
    
    // Add columns to existing artists table if not exist
    try { await client.execute(`ALTER TABLE artists ADD COLUMN username TEXT`); } catch(e) {}
    try { await client.execute(`ALTER TABLE artists ADD COLUMN last_active_at TEXT`); } catch(e) {}
    try { await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS artists_username_unique ON artists(username)`); } catch(e) {}

    console.log("DB Fixed successfully!");
  } catch (e) {
    console.error("DB Fix Error:", e.message);
  }
}

run();
