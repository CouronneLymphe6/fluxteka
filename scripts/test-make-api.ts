import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const TOKEN = process.env.MAKE_API_TOKEN;
const BASE = 'https://eu1.make.com';
const TEAM_ID = 1797770;

async function test(endpoint: string) {
  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      headers: { 'Authorization': `Token ${TOKEN}`, 'Accept': 'application/json' },
    });
    const body = await res.text();
    const preview = body.substring(0, 300).replace(/\n/g, ' ');
    console.log(`${res.ok ? '✅' : '❌'} ${res.status} ${endpoint}`);
    console.log(`   → ${preview}\n`);
  } catch (e) {
    console.log(`💥 ${endpoint} → ${e}\n`);
  }
}

async function main() {
  console.log(`🔍 Make API — Team ID: ${TEAM_ID}\n`);
  await test(`/api/v2/templates?teamId=${TEAM_ID}`);
  await test(`/api/v2/teams/${TEAM_ID}/templates`);
  await test(`/api/v2/templates?teamId=${TEAM_ID}&pg[limit]=5`);
  await test(`/api/v2/scenarios?teamId=${TEAM_ID}&pg[limit]=3`);
}
main();
