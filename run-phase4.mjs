import pg from 'pg';
import { readFileSync } from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres:7cc65181f42a5c1e18987e1a5e0b49ca@kugpe8zm.us-east.database.insforge.app:5432/insforge?sslmode=require'
});

const sql = readFileSync('migrations/20260718010000_create-decisions-rules-notifications.sql', 'utf-8');

try {
  await client.connect();
  await client.query(sql);
  console.log('Migration applied successfully!');

  // Verify
  const decisions = await client.query('SELECT count(*) FROM ai_decisions');
  const rules = await client.query('SELECT count(*) FROM automation_rules');
  const notifications = await client.query('SELECT count(*) FROM notifications');
  console.log(`Decisions: ${decisions.rows[0].count}, Rules: ${rules.rows[0].count}, Notifications: ${notifications.rows[0].count}`);
} catch (e) {
  console.error('ERROR:', e.message);
} finally {
  await client.end();
}
