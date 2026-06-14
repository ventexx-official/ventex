-- 006_roles.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS role text
  CHECK (role IN ('founder','investor','buyer','visitor', 'explorer', 'admin')) DEFAULT 'visitor';

ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
