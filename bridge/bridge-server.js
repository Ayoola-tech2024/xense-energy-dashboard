// Xense Energy — MQTT Bridge + Health Check Server (plain JS)
// No TypeScript needed — runs directly with Node.js

const mqtt = require('mqtt');
const { Client } = require('pg');
const { createServer } = require('http');

// ── Config from environment ──
const MQTT_BROKER = process.env.MQTT_BROKER_URL || 'mqtts://localhost:8883';
const MQTT_USER = process.env.MQTT_USERNAME || '';
const MQTT_PASS = process.env.MQTT_PASSWORD || '';
const DATABASE_URL = process.env.DATABASE_URL || '';
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'xense';
const PORT = parseInt(process.env.PORT || '3001', 10);

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set.');
  process.exit(1);
}

// ── Stats ──
let messageCount = 0;
let errorCount = 0;
const startTime = Date.now();
let mqttConnected = false;
let pgConnected = false;

// ── Health check server ──
const server = createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    const uptime = ((Date.now() - startTime) / 1000).toFixed(0);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: mqttConnected && pgConnected ? 'healthy' : 'degraded',
      mqtt: mqttConnected ? 'connected' : 'disconnected',
      postgres: pgConnected ? 'connected' : 'disconnected',
      messagesProcessed: messageCount,
      errors: errorCount,
      uptimeSeconds: parseInt(uptime),
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Health check server listening on port ${PORT}`);
});

// ── Postgres Client ──
const pg = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

// ── Insert reading ──
async function insertReading(data) {
  const fields = [
    'device_id', 'pv_voltage', 'pv_current', 'pv_power',
    'battery_percent', 'battery_voltage', 'battery_temperature',
    'battery_charging', 'battery_discharging',
    'load_power', 'grid_power', 'grid_status',
    'frequency', 'ac_voltage',
    'today_production', 'today_consumption',
    'relay_state', 'mode', 'device_online',
    'wifi_strength', 'firmware_version', 'inverter_temperature',
  ];

  const values = fields.map(f => {
    const v = data[f];
    if (v === undefined || v === null) return null;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v;
    return String(v);
  });

  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO energy_readings (${fields.join(', ')}) VALUES (${placeholders})`;
  await pg.query(sql, values);
}

// ── Start ──
async function main() {
  // Connect PostgreSQL
  await pg.connect();
  pgConnected = true;
  console.log('✅ Connected to PostgreSQL');

  // Connect MQTT
  const mqttOptions = {
    clientId: `bridge-${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  };
  if (MQTT_USER) mqttOptions.username = MQTT_USER;
  if (MQTT_PASS) mqttOptions.password = MQTT_PASS;

  const mqttClient = mqtt.connect(MQTT_BROKER, mqttOptions);

  mqttClient.on('connect', () => {
    mqttConnected = true;
    console.log(`✅ Connected to MQTT broker: ${MQTT_BROKER}`);
    const topic = `${TOPIC_PREFIX}/+/telemetry`;
    mqttClient.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Subscribe error:', err.message);
      } else {
        console.log(`✅ Subscribed to: ${topic}`);
        console.log('🔄 Waiting for ESP32 messages...\n');
      }
    });
  });

  mqttClient.on('message', async (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      await insertReading(data);
      messageCount++;

      const time = new Date().toLocaleTimeString();
      const solar = Number(data.pv_power) || 0;
      const batt = Number(data.battery_percent) || 0;
      const load = Number(data.load_power) || 0;
      const deviceId = data.device_id || 'unknown';
      console.log(`[${time}] ✅ ${deviceId}: solar=${solar}W batt=${batt}% load=${load}W`);
    } catch (err) {
      errorCount++;
      console.error(`❌ Error:`, err.message?.slice(0, 100));
    }
  });

  mqttClient.on('error', (err) => {
    mqttConnected = false;
    console.error('❌ MQTT error:', err.message);
  });

  mqttClient.on('offline', () => {
    mqttConnected = false;
    console.log('⚠️  MQTT disconnected, reconnecting...');
  });

  mqttClient.on('reconnect', () => {
    console.log('🔄 MQTT reconnecting...');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    console.log(`\n🛑 Stopped. ${messageCount} messages in ${elapsed}s`);
    mqttClient.end();
    await pg.end();
    server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('❌ Fatal:', err.message);
  process.exit(1);
});
