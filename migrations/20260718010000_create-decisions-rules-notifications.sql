-- Phase 4: Decisions, Rules, Notifications tables

-- 1. ai_decisions: logs every load on/off decision
CREATE TABLE IF NOT EXISTS public.ai_decisions (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  appliance TEXT NOT NULL,
  icon TEXT,
  status TEXT NOT NULL DEFAULT 'on',
  reason TEXT,
  load_watts NUMERIC,
  confidence TEXT,
  duration TEXT,
  priority INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_device ON public.ai_decisions (device_id, created_at DESC);

-- 2. automation_rules: user-configured rules
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT,
  condition_text TEXT NOT NULL,
  action_text TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  icon TEXT,
  icon_bg TEXT,
  icon_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. notifications: system event log
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT,
  icon TEXT,
  icon_bg TEXT,
  icon_color TEXT,
  title TEXT NOT NULL,
  description TEXT,
  unread BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications (unread, created_at DESC);

-- RLS
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dashboard can read decisions' AND tablename = 'ai_decisions') THEN
    CREATE POLICY "dashboard can read decisions" ON public.ai_decisions FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service can insert decisions' AND tablename = 'ai_decisions') THEN
    CREATE POLICY "service can insert decisions" ON public.ai_decisions FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dashboard can read rules' AND tablename = 'automation_rules') THEN
    CREATE POLICY "dashboard can read rules" ON public.automation_rules FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'dashboard can read notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "dashboard can read notifications" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service can insert notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "service can insert notifications" ON public.notifications FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- Grants
GRANT SELECT ON public.ai_decisions TO anon, authenticated;
GRANT INSERT ON public.ai_decisions TO anon;
GRANT SELECT ON public.automation_rules TO anon, authenticated;
GRANT SELECT ON public.notifications TO anon, authenticated;
GRANT INSERT ON public.notifications TO anon;

-- Seed: 4 decisions
INSERT INTO public.ai_decisions (device_id, appliance, icon, status, reason, load_watts, confidence, duration, priority, created_at) VALUES
  ('esp32-xs-001', 'Air Conditioner', 'snowflake', 'on', 'Battery 72% · Solar 1.8 kW · Sufficient energy', 1200, 'Optimal', NULL, 4, NOW() - INTERVAL '2 hours'),
  ('esp32-xs-002', 'Freezer', 'snowflake', 'off', 'Battery 30% · Xense logic disconnected load', 350, 'Required', '1h 27m', 3, NOW() - INTERVAL '3 hours'),
  ('esp32-xs-003', 'Water Heater', 'shower', 'standby', 'Insufficient solar (320 W) · Needs 2,000 W', 2000, 'Pending', NULL, 5, NOW() - INTERVAL '4 hours'),
  ('esp32-xs-003', 'TV & Entertainment', 'tv', 'on', 'Battery 68% · Low load (150 W) · Permitted', 150, 'Favorable', NULL, 3, NOW() - INTERVAL '1 hour');

-- Seed: 4 rules
INSERT INTO public.automation_rules (device_id, condition_text, action_text, active, icon, icon_bg, icon_color) VALUES
  (NULL, 'IF Battery > 80% AND Solar > 2,000 W', 'Turn ON Air Conditioner', true, 'sun', 'rgba(52,211,153,0.1)', '#34d399'),
  (NULL, 'IF Battery < 35%', 'Turn OFF Freezer & Water Heater', true, 'battery-low', 'rgba(248,113,113,0.1)', '#f87171'),
  (NULL, 'IF Grid Available AND Battery < 20%', 'Switch to Automatic Mode (Grid)', true, 'bolt', 'rgba(251,191,36,0.1)', '#fbbf24'),
  (NULL, 'IF Time = 10:00 PM - 6:00 AM', 'Turn OFF All Non-Essential Loads', false, 'clock', 'rgba(96,165,250,0.1)', '#60a5fa');

-- Seed: 5 notifications
INSERT INTO public.notifications (device_id, icon, icon_bg, icon_color, title, description, unread, created_at) VALUES
  (NULL, 'bolt', 'rgba(52,211,153,0.1)', '#34d399', 'Grid Restored', 'Power grid is back. System switched to Automatic Mode.', true, NOW() - INTERVAL '2 minutes'),
  (NULL, 'battery-quarter', 'rgba(248,113,113,0.1)', '#f87171', 'Battery Low Alert', 'Battery dropped to 30%. Xense logic disconnected Freezer.', true, NOW() - INTERVAL '1 hour'),
  (NULL, 'sun', 'rgba(251,191,36,0.1)', '#fbbf24', 'Solar Peak', 'Solar production reached 2.4 kW. Air Conditioner turned ON.', false, NOW() - INTERVAL '3 hours'),
  (NULL, 'check', 'rgba(52,211,153,0.1)', '#34d399', 'Mode Changed', 'System switched to Xense Mode automatically.', false, NOW() - INTERVAL '5 hours'),
  ('esp32-xs-003', 'wifi', 'rgba(96,165,250,0.1)', '#60a5fa', 'Device Online', 'XS-PLUG-003 reconnected. Signal strength: -68 dBm.', false, NOW() - INTERVAL '1 day');
