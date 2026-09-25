-- ==========================================================
-- EasyAcss Gaming Vault - Supabase Database Schema
-- Run this in your Supabase Project -> SQL Editor -> Click RUN
-- ==========================================================

-- 1. App Settings Table (Adsterra Ads, Popunders, Banners, Shortlinks, Site Content)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  adsterra_config JSONB NOT NULL DEFAULT '{
    "enabled": true,
    "publisherId": "",
    "directLinkUrl": "",
    "popunderEnabled": true,
    "triggerPopunderOnClaim": false,
    "popunderOnFirstClick": false,
    "popunderCode": "",
    "socialBarEnabled": true,
    "socialBarCode": "",
    "banner728x90Top": "",
    "banner728x90Bottom": "",
    "banner300x250Sidebar": "",
    "banner468x60Claim": "",
    "nativeBannerCode": "",
    "inFeedAdsEnabled": true
  }'::jsonb,
  shortlink_config JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "provider": "cutly",
    "domain": "cutt.ly",
    "apiToken": "",
    "timerSeconds": 5,
    "bypassForVip": true,
    "simulatedLatency": false
  }'::jsonb,
  site_content JSONB NOT NULL DEFAULT '{
    "siteName": "EasyAcss",
    "subTitle": "Free Steam offline gaming accounts, instant credentials unlock, and active 2FA dispatching.",
    "announcement": "🔥 New Steam accounts added daily! Check back often.",
    "announcementActive": true,
    "discordUrl": "https://discord.gg/easyacss",
    "discordServerName": "EasyAcss Official",
    "supportUrl": "https://discord.gg/easyacss",
    "telegramUrl": "https://t.me/easyacss",
    "rules": [
      "Do not change the account credentials (email or password).",
      "Switch Steam to \"Go Offline\" mode immediately after logging in.",
      "Do not activate Steam Guard Family sharing or modify security settings.",
      "Use accounts strictly for offline single-player playthroughs."
    ]
  }'::jsonb,
  vip_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Flexible Key-Value App Configs Table (Fast JSON Store)
CREATE TABLE IF NOT EXISTS public.app_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Game Accounts Inventory Table
CREATE TABLE IF NOT EXISTS public.game_accounts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'Steam',
  account_type TEXT NOT NULL DEFAULT 'standard',
  cover_image TEXT,
  badge TEXT DEFAULT 'Verified',
  views INTEGER DEFAULT 0,
  game_count INTEGER DEFAULT 1,
  included_games JSONB DEFAULT '[]'::jsonb,
  total_value_usd NUMERIC DEFAULT 0,
  stock INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  last_verified TEXT,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  link_config JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  favorites INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Member Users Table
CREATE TABLE IF NOT EXISTS public.member_users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  avatar TEXT,
  created_at TEXT DEFAULT 'Recently',
  favorites JSONB DEFAULT '[]'::jsonb,
  claims_count INTEGER DEFAULT 0
);

-- 5. Claim Activities Log Table
CREATE TABLE IF NOT EXISTS public.claim_activities (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'claim',
  action TEXT,
  username TEXT NOT NULL DEFAULT 'Guest',
  account_id TEXT,
  account_title TEXT NOT NULL,
  platform TEXT DEFAULT 'Steam',
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Completed',
  ip TEXT DEFAULT '127.0.0.1',
  details TEXT
);

-- Seed initial global settings row if empty
INSERT INTO public.app_settings (id, updated_at)
VALUES ('global', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed default master admin member
INSERT INTO public.member_users (id, username, email, password, role, avatar, created_at, favorites, claims_count)
VALUES (
  'member-master-adam',
  'adam',
  'adam@easyacss.com',
  'adam12',
  'admin',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'Master Admin',
  '[]'::jsonb,
  0
)
ON CONFLICT (username) DO NOTHING;

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allows public visitors (anon) to read and admin to save
-- ==========================================================

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_activities ENABLE ROW LEVEL SECURITY;

-- 1. Policies for app_settings
DROP POLICY IF EXISTS "Public read app_settings" ON public.app_settings;
CREATE POLICY "Public read app_settings" ON public.app_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert/update app_settings" ON public.app_settings;
CREATE POLICY "Public insert/update app_settings" ON public.app_settings
  FOR ALL USING (true) WITH CHECK (true);

-- 2. Policies for app_configs
DROP POLICY IF EXISTS "Public read app_configs" ON public.app_configs;
CREATE POLICY "Public read app_configs" ON public.app_configs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert/update app_configs" ON public.app_configs;
CREATE POLICY "Public insert/update app_configs" ON public.app_configs
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Policies for game_accounts
DROP POLICY IF EXISTS "Public read game_accounts" ON public.game_accounts;
CREATE POLICY "Public read game_accounts" ON public.game_accounts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert/update game_accounts" ON public.game_accounts;
CREATE POLICY "Public insert/update game_accounts" ON public.game_accounts
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Policies for member_users
DROP POLICY IF EXISTS "Public read member_users" ON public.member_users;
CREATE POLICY "Public read member_users" ON public.member_users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert/update member_users" ON public.member_users;
CREATE POLICY "Public insert/update member_users" ON public.member_users
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Policies for claim_activities
DROP POLICY IF EXISTS "Public read claim_activities" ON public.claim_activities;
CREATE POLICY "Public read claim_activities" ON public.claim_activities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert/update claim_activities" ON public.claim_activities;
CREATE POLICY "Public insert/update claim_activities" ON public.claim_activities
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime publication for instant updates
-- ==========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_configs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_configs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'game_accounts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_accounts;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Realtime publication already exists or handles cleanly
    NULL;
END $$;
