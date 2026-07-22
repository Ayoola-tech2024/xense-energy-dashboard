// Xense Energy — MQTT Bridge + Health Check (minimal Node.js)
const mqtt = require('mqtt');
const { Client } = require('pg');
const { createServer } = require('http');

const MQTT_BROKER = process.env.MQTT_BROKER_URL;
const MQTT_USER = process.env.MQTT_USERNAME || '';
const MQTT_PASS = process.env.MQTT_PASSWORD || '';
const DATABASE_URL = process.env.DATABASE_URL;
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'xense';
const PORT = process.env.PORT || 3001;

if (!DATABASE_URL || !MQTT_BROKER) {
  console.error('❌ Missing DATABASE_URL or MQTT_BROKER_URL');
  process.exit(1);
}

let messageCount = 0;
let mqttOk = false;
let pgOk = false;
const t0 = Date.now();

const server = createServer((req, res) => {
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify({ok:true, mqtt:mqttOk, pg:pgOk, msgs:messageCount, up:((Date.now()-t0)/1000|0)}));
});
server.listen(PORT, () => console.log(`🌐 :${PORT}`));

const pg = new Client({connectionString:DATABASE_URL, ssl:{rejectUnauthorized:false}});

async function insert(d) {
  const f = ['device_id','pv_voltage','pv_current','pv_power','battery_percent','battery_voltage','battery_temperature','battery_charging','battery_discharging','load_power','grid_power','grid_status','frequency','ac_voltage','today_production','today_consumption','relay_state','mode','device_online','wifi_strength','firmware_version','inverter_temperature'];
  const v = f.map(k => {const x=d[k]; return x==null?null:typeof x==='boolean'?x:typeof x==='number'?x:String(x);});
  await pg.query(`INSERT INTO energy_readings (${f.join(',')}) VALUES (${f.map((_,i)=>'$'+(i+1)).join(',')})`, v);
}

(async()=>{
  await pg.connect(); pgOk=true; console.log('✅ pg');
  const c = mqtt.connect(MQTT_BROKER, {clientId:'br-'+Math.random().toString(16).slice(2,8), clean:true, reconnectPeriod:5000, connectTimeout:10000, username:MQTT_USER||undefined, password:MQTT_PASS||undefined});
  c.on('connect', ()=>{ mqttOk=true; console.log('✅ mqtt');
    c.subscribe(TOPIC_PREFIX+'/+/telemetry',{qos:1}, e=>{ if(e) console.error(e); else console.log('✅ sub'); });
  });
  c.on('message', async(_,p)=>{ try{ const d=JSON.parse(p.toString()); await insert(d); messageCount++;
    console.log(`[${new Date().toLocaleTimeString()}] ${d.device_id} solar=${d.pv_power}W batt=${d.battery_percent}%`);
  }catch(e){ console.error('❌',e.message); }});
  c.on('error', e=>{ mqttOk=false; console.error('❌ mqtt',e.message); });
  process.on('SIGINT', ()=>{ c.end(); pg.end(); server.close(); process.exit(0); });
})().catch(e=>{ console.error('❌',e.message); process.exit(1); });
