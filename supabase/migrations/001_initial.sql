-- 智慧档案：每个用户自己的记录（id 与前端一致，便于同步）
CREATE TABLE IF NOT EXISTS wisdom (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  insight TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

-- 树木：每个用户森林中的树
CREATE TABLE IF NOT EXISTS trees (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wisdom_id TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('sapling', 'growing', 'mature', 'fruiting')),
  planted_at BIGINT NOT NULL,
  stage_started_at BIGINT NOT NULL,
  last_watered BIGINT NOT NULL,
  type TEXT NOT NULL,
  has_produced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

-- 用户扩展数据：库存、统计、解锁等
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory INT NOT NULL DEFAULT 0,
  collected INT NOT NULL DEFAULT 0,
  unlocked_species TEXT[] NOT NULL DEFAULT ARRAY['oak','willow','pine','maple','bamboo'],
  purchased_species TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  has_speed_boost BOOLEAN NOT NULL DEFAULT false,
  my_collection JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS：仅允许用户读写自己的数据
ALTER TABLE wisdom ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wisdom_select" ON wisdom FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wisdom_insert" ON wisdom FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wisdom_update" ON wisdom FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "wisdom_delete" ON wisdom FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "trees_select" ON trees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "trees_insert" ON trees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "trees_update" ON trees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "trees_delete" ON trees FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "user_stats_select" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_stats_insert" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_stats_update" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- 索引
CREATE INDEX IF NOT EXISTS idx_wisdom_user_id ON wisdom(user_id);
CREATE INDEX IF NOT EXISTS idx_trees_user_id ON trees(user_id);
