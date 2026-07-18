-- Xense Energy: Core tables, RLS, RPC functions, and data retention

-- ─────────────────────────────────────────────
-- 1. energy_readings — live telemetry from ESP32
-- ─────────────────────────────────────────────
CREATE TABLE public.energy_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  battery_percent NUMERIC,
  battery_voltage NUMERIC,
  battery_temperature NUMERIC,
  battery_charging BOOLEAN,
  battery_discharging BOOLEAN,
  pv_voltage NUMERIC,
  pv_current NUMERIC,
  pv_power NUMERIC,
  load_power NUMERIC,
  grid_power NUMERIC,
  grid_status TEXT,
  frequency NUMERIC,
  ac_voltage NUMERIC,
  today_production NUMERIC,
  today_consumption NUMERIC,
  relay_state TEXT,
  mode TEXT,
  device_online TEXT,
  wifi_strength NUMERIC,
  firmware_version TEXT,
  inverter_temperature NUMERIC,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index: latest reading per device (most common query)
CREATE INDEX idx_energy_readings_device_timestamp
  ON public.energy_readings (device_id, timestamp DESC);

-- RLS
ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY;

-- ESP32 can INSERT readings (uses anon key)
CREATE POLICY "esp32 can insert readings"
  ON public.energy_readings FOR INSERT TO anon
  WITH CHECK (true);

-- Dashboard can read readings (uses anon key)
CREATE POLICY "dashboard can read readings"
  ON public.energy_readings FOR SELECT TO anon, authenticated
  USING (true);

-- Grants
GRANT SELECT ON public.energy_readings TO anon, authenticated;
GRANT INSERT ON public.energy_readings TO anon;

-- ─────────────────────────────────────────────
-- 2. devices — registered smart plugs
-- ─────────────────────────────────────────────
CREATE TABLE public.devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  appliance TEXT,
  location TEXT,
  status TEXT DEFAULT 'offline',
  mode TEXT DEFAULT 'xense',
  power NUMERIC DEFAULT 0,
  signal NUMERIC DEFAULT 0,
  online BOOLEAN DEFAULT false,
  relay_on BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Dashboard can read devices
CREATE POLICY "dashboard can read devices"
  ON public.devices FOR SELECT TO anon, authenticated
  USING (true);

-- Service role can update devices (ESP32 telemetry writes)
CREATE POLICY "service can update devices"
  ON public.devices FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT SELECT ON public.devices TO anon, authenticated;
GRANT UPDATE ON public.devices TO anon;

-- ─────────────────────────────────────────────
-- 3. RPC functions — mode change & relay control
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_device_mode(p_device_id TEXT, p_mode TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.devices
  SET mode = p_mode, updated_at = NOW()
  WHERE id = p_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp;

CREATE OR REPLACE FUNCTION public.set_device_relay(p_device_id TEXT, p_state TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.devices
  SET relay_on = (p_state = 'closed'), updated_at = NOW()
  WHERE id = p_device_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp;

GRANT EXECUTE ON FUNCTION public.set_device_mode TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_device_relay TO anon, authenticated;

-- ─────────────────────────────────────────────
-- 4. Data retention — cleanup readings older than 7 days
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_old_readings()
RETURNS void AS $$
BEGIN
  DELETE FROM public.energy_readings WHERE timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp;

GRANT EXECUTE ON FUNCTION public.cleanup_old_readings TO anon;
