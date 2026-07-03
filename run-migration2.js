const { execSync } = require('child_process');
try {
  execSync('npx drizzle-kit push', { stdio: 'inherit', env: { ...process.env, TURSO_CONNECTION_URL: "libsql://platinumeramusic-platinumeramusic.aws-ap-northeast-1.turso.io", TURSO_AUTH_TOKEN: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODM1MjAxNDYsImdpZCI6IjA5NWRlMzgwLWZkNGYtNDVlYS04MzYzLWI0ODhhMjdhOTQxOCIsImlhdCI6MTc4MjkxNTM0Niwia2lkIjoiRW1LTGpCSGZ0QUlwUHFBeEZxcHV5aGhFY0xHeWFzLUJsR3FoOTRlNFo0USIsInJpZCI6IjlhMThkNmU3LTQ4NGEtNGM1Ni1hYjRjLTI5N2FkNWNmMGMwYyJ9.jswkRdVRLacnyDL4j9YvGWZ3TuN3rmMOg_ZvgACH3pPZDp7NH55qUu1Z4fymwD1CVQ678KS8Qpp-FlC1hJUuAA" } });
} catch (e) {
  console.log("Migration failed");
}
