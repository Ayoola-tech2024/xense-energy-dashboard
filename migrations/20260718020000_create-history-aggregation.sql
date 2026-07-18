-- Phase 7: History Aggregation Tables + Triggers

-- Hourly summary
CREATE TABLE IF NOT EXISTS public.hourly_energy_summary (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  hour_start TIMESTAMPTZ NOT NULL,
  avg_pv_power NUMERIC,
  avg_load_power NUMERIC,
  total_pv_kwh NUMERIC DEFAULT 0,
  total_load_kwh NUMERIC DEFAULT 0,
  reading_count INTEGER DEFAULT 0,
  UNIQUE(device_id, hour_start)
);
CREATE INDEX IF NOT EXISTS idx_hourly_summary_device_hour ON public.hourly_energy_summary (device_id, hour_start DESC);

-- Daily summary
CREATE TABLE IF NOT EXISTS public.daily_energy_summary (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  day_date DATE NOT NULL,
  total_pv_kwh NUMERIC DEFAULT 0,
  total_load_kwh NUMERIC DEFAULT 0,
  avg_battery_percent NUMERIC,
  peak_pv_power NUMERIC,
  peak_load_power NUMERIC,
  reading_count INTEGER DEFAULT 0,
  UNIQUE(device_id, day_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_summary_device_day ON public.daily_energy_summary (device_id, day_date DESC);

-- RLS
ALTER TABLE public.hourly_energy_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_energy_summary ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dashboard can read hourly summary' AND tablename = 'hourly_energy_summary') THEN
    CREATE POLICY "dashboard can read hourly summary" ON public.hourly_energy_summary FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dashboard can read daily summary' AND tablename = 'daily_energy_summary') THEN
    CREATE POLICY "dashboard can read daily summary" ON public.daily_energy_summary FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

GRANT SELECT ON public.hourly_energy_summary TO anon, authenticated;
GRANT SELECT ON public.daily_energy_summary TO anon, authenticated;

-- Trigger: update hourly summary on each new reading
CREATE OR REPLACE FUNCTION public.update_hourly_summary()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.hourly_energy_summary (device_id, hour_start, avg_pv_power, avg_load_power, total_pv_kwh, total_load_kwh, reading_count)
  VALUES (
    NEW.device_id,
    date_trunc('hour', NEW.timestamp),
    NEW.pv_power,
    NEW.load_power,
    COALESCE(NEW.pv_power, 0) / 1000.0 * 5.0 / 3600.0,
    COALESCE(NEW.load_power, 0) / 1000.0 * 5.0 / 3600.0,
    1
  )
  ON CONFLICT (device_id, hour_start) DO UPDATE SET
    avg_pv_power = (hourly_energy_summary.avg_pv_power * hourly_energy_summary.reading_count + COALESCE(NEW.pv_power, 0)) / (hourly_energy_summary.reading_count + 1),
    avg_load_power = (hourly_energy_summary.avg_load_power * hourly_energy_summary.reading_count + COALESCE(NEW.load_power, 0)) / (hourly_energy_summary.reading_count + 1),
    total_pv_kwh = hourly_energy_summary.total_pv_kwh + COALESCE(NEW.pv_power, 0) / 1000.0 * 5.0 / 3600.0,
    total_load_kwh = hourly_energy_summary.total_load_kwh + COALESCE(NEW.load_power, 0) / 1000.0 * 5.0 / 3600.0,
    reading_count = hourly_energy_summary.reading_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_hourly_summary ON public.energy_readings;
CREATE TRIGGER trg_update_hourly_summary
  AFTER INSERT ON public.energy_readings
  FOR EACH ROW EXECUTE FUNCTION public.update_hourly_summary();

-- Trigger: update daily summary on each new reading
CREATE OR REPLACE FUNCTION public.update_daily_summary()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.daily_energy_summary (device_id, day_date, total_pv_kwh, total_load_kwh, avg_battery_percent, peak_pv_power, peak_load_power, reading_count)
  VALUES (
    NEW.device_id,
    NEW.timestamp::date,
    COALESCE(NEW.pv_power, 0) / 1000.0 * 5.0 / 3600.0,
    COALESCE(NEW.load_power, 0) / 1000.0 * 5.0 / 3600.0,
    NEW.battery_percent,
    NEW.pv_power,
    NEW.load_power,
    1
  )
  ON CONFLICT (device_id, day_date) DO UPDATE SET
    total_pv_kwh = daily_energy_summary.total_pv_kwh + COALESCE(NEW.pv_power, 0) / 1000.0 * 5.0 / 3600.0,
    total_load_kwh = daily_energy_summary.total_load_kwh + COALESCE(NEW.load_power, 0) / 1000.0 * 5.0 / 3600.0,
    avg_battery_percent = (daily_energy_summary.avg_battery_percent * daily_energy_summary.reading_count + COALESCE(NEW.battery_percent, 0)) / (daily_energy_summary.reading_count + 1),
    peak_pv_power = GREATEST(COALESCE(daily_energy_summary.peak_pv_power, 0), COALESCE(NEW.pv_power, 0)),
    peak_load_power = GREATEST(COALESCE(daily_energy_summary.peak_load_power, 0), COALESCE(NEW.load_power, 0)),
    reading_count = daily_energy_summary.reading_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_daily_summary ON public.energy_readings;
CREATE TRIGGER trg_update_daily_summary
  AFTER INSERT ON public.energy_readings
  FOR EACH ROW EXECUTE FUNCTION public.update_daily_summary();
