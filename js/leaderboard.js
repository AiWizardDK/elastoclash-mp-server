// js/leaderboard.js

import { supabase } from './auth.js';

// Gem et resultat på leaderboardet
export async function submitScore({ name, time, ghost, hash, user_id }) {
  const { error } = await supabase
    .from('leaderboard')
    .insert([{ name, time, ghost, hash, user_id }]);
  if (error) {
    console.error("Kunne ikke gemme score:", error);
  }
}

// Hent top-10 scores (hurtigste tider først)
export async function fetchLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('time', { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Kunne ikke hente leaderboard:", error);
    return [];
  }
  return data;
}

// Hent scores for én bruger
export async function fetchUserScores(user_id) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', user_id)
    .order('time', { ascending: true });

  if (error) {
    console.error("Kunne ikke hente dine scores:", error);
    return [];
  }
  return data;
}

// Slet en score (kun hvis du er ejer!)
export async function deleteScore(score_id, user_id) {
  const { error } = await supabase
    .from('leaderboard')
    .delete()
    .eq('id', score_id)
    .eq('user_id', user_id);

  if (error) {
    console.error("Kunne ikke slette score:", error);
  }
}
