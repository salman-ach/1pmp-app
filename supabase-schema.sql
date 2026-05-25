-- ============================================================
-- Supabase SQL Schema — Calorie Tracker App
-- Coller dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Table principale : stocke les entrées alimentaires
CREATE TABLE IF NOT EXISTS calorie_logs (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name   TEXT        NOT NULL,
  calories    INTEGER     NOT NULL,
  meal_type   TEXT        NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  log_date    DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes rapides par utilisateur
CREATE INDEX IF NOT EXISTS idx_calorie_logs_user_id
  ON calorie_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_calorie_logs_date
  ON calorie_logs (log_date);

-- ── Row Level Security (RLS) ─────────────────────────────────────────
ALTER TABLE calorie_logs ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs ne voient que leurs propres données
CREATE POLICY "Users can view own logs"
  ON calorie_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON calorie_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON calorie_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON calorie_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ── Trigger : met à jour updated_at automatiquement ──────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_calorie_logs_updated_at
  BEFORE UPDATE ON calorie_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
