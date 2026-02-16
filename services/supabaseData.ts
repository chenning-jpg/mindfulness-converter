import { supabase } from "../lib/supabase";
import type { Tree, Wisdom, CommunityFruit } from "../types";
import { TREE_SPECIES_DB } from "../types";
import type { TreeType } from "../types";

// ---------- 智慧档案 ----------
export async function fetchWisdom(userId: string): Promise<Wisdom[]> {
  const { data, error } = await supabase
    .from("wisdom")
    .select("id, title, situation, insight, date")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    situation: r.situation,
    insight: r.insight,
    date: r.date,
  }));
}

export async function insertWisdom(userId: string, w: Wisdom): Promise<void> {
  const { error } = await supabase.from("wisdom").insert({
    user_id: userId,
    id: w.id,
    title: w.title,
    situation: w.situation,
    insight: w.insight,
    date: w.date,
  });
  if (error) throw error;
}

// ---------- 树木 ----------
export async function fetchTrees(userId: string): Promise<Tree[]> {
  const { data, error } = await supabase
    .from("trees")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    wisdomId: r.wisdom_id,
    stage: r.stage,
    plantedAt: r.planted_at,
    stageStartedAt: r.stage_started_at,
    lastWatered: r.last_watered,
    type: r.type as TreeType,
    speciesConfig: TREE_SPECIES_DB[r.type as TreeType],
    hasProduced: r.has_produced ?? false,
  }));
}

export async function insertTree(userId: string, t: Tree): Promise<void> {
  const { error } = await supabase.from("trees").insert({
    user_id: userId,
    id: t.id,
    wisdom_id: t.wisdomId,
    stage: t.stage,
    planted_at: t.plantedAt,
    stage_started_at: t.stageStartedAt,
    last_watered: t.lastWatered,
    type: t.type,
    has_produced: t.hasProduced ?? false,
  });
  if (error) throw error;
}

export async function updateTree(userId: string, t: Tree): Promise<void> {
  const { error } = await supabase
    .from("trees")
    .update({
      stage: t.stage,
      stage_started_at: t.stageStartedAt,
      last_watered: t.lastWatered,
      has_produced: t.hasProduced ?? false,
    })
    .eq("id", t.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function syncAllTrees(userId: string, trees: Tree[]): Promise<void> {
  if (trees.length === 0) return;
  const rows = trees.map((t) => ({
    user_id: userId,
    id: t.id,
    wisdom_id: t.wisdomId,
    stage: t.stage,
    planted_at: t.plantedAt,
    stage_started_at: t.stageStartedAt,
    last_watered: t.lastWatered,
    type: t.type,
    has_produced: t.hasProduced ?? false,
  }));
  const { error } = await supabase.from("trees").upsert(rows, { onConflict: "user_id,id" });
  if (error) throw error;
}

// ---------- 用户统计与扩展 ----------
export interface UserStatsRow {
  inventory: number;
  collected: number;
  unlocked_species: string[];
  purchased_species: string[];
  has_speed_boost: boolean;
  my_collection: CommunityFruit[];
}

export async function fetchUserStats(userId: string): Promise<UserStatsRow | null> {
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null; // no row
    throw error;
  }
  return {
    inventory: data.inventory ?? 0,
    collected: data.collected ?? 0,
    unlocked_species: data.unlocked_species ?? [],
    purchased_species: data.purchased_species ?? [],
    has_speed_boost: data.has_speed_boost ?? false,
    my_collection: Array.isArray(data.my_collection) ? data.my_collection : [],
  };
}

export async function upsertUserStats(
  userId: string,
  stats: {
    inventory?: number;
    collected?: number;
    unlocked_species?: string[];
    purchased_species?: string[];
    has_speed_boost?: boolean;
    my_collection?: CommunityFruit[];
  }
): Promise<void> {
  const payload: Record<string, unknown> = { user_id: userId, updated_at: new Date().toISOString() };
  if (stats.inventory !== undefined) payload.inventory = stats.inventory;
  if (stats.collected !== undefined) payload.collected = stats.collected;
  if (stats.unlocked_species !== undefined) payload.unlocked_species = stats.unlocked_species;
  if (stats.purchased_species !== undefined) payload.purchased_species = stats.purchased_species;
  if (stats.has_speed_boost !== undefined) payload.has_speed_boost = stats.has_speed_boost;
  if (stats.my_collection !== undefined) payload.my_collection = stats.my_collection;
  const { error } = await supabase.from("user_stats").upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
}

export async function ensureUserStatsRow(userId: string): Promise<void> {
  const existing = await fetchUserStats(userId);
  if (existing) return;
  const { error } = await supabase.from("user_stats").insert({
    user_id: userId,
    inventory: 0,
    collected: 0,
    unlocked_species: ["oak", "willow", "pine", "maple", "bamboo"],
    purchased_species: [],
    has_speed_boost: false,
    my_collection: [],
  });
  if (error) throw error;
}
