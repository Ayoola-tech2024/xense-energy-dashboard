import pg from 'pg';
import { readFileSync } from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:7cc65181f42a5c1e18987e1a5e0b49ca@kugpe8zm.us-east.database.insforge.app:5432/insforge?sslmode=require'
});

const sql = readFileSync('migrations/20260718020000_create-history-aggregation.sql', 'utf-8');

try {
  await client.connect();
  await client.query(sql);
  console.log('Phase 7 migration applied successfully!');

  const hourly = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('hourly_energy_summary', 'daily_energy_summary')");
  console.log('Tables created:', hourly.rows.map(r => r.table_name));

  const triggers = await client.query("SELECT trigger_name FROM information_schema.triggers WHERE trigger_name LIKE 'trg_update_%'");
  console.log('Triggers:', triggers.rows.map(r => r.trigger_name));
} catch (e) {
  console.error('ERROR:', e.message);
} finally {
  await client.end();
}
