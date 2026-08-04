import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This test requires a local Supabase instance running via `supabase start`
// It tests the SQL trigger `recalc_game_hours` directly in the database.
// Ensure you have SUPABASE_SERVICE_ROLE_KEY in your local environment variables
// if you are running this against a live or local db with RLS enabled.
// For local testing, you can usually find this by running `supabase status`.

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
// Using anon key or service key. To bypass RLS and create users, service key is needed.
// Defaulting to the known local anon key for testing if service key is missing, 
// though profile insertion might fail if RLS blocks it without service key.
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Skip tests if no key is provided (e.g. running in CI without setup)
const runTest = SUPABASE_KEY ? describe : describe.skip;

runTest('recalc_game_hours SQL Trigger', () => {
  let supabase: ReturnType<typeof createClient>;
  const testUserId = 'test-user-' + Date.now();
  const testGameId = 'test-game-' + Date.now();

  beforeAll(async () => {
    if (!SUPABASE_KEY) return;
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    // Create a dummy user profile
    await supabase.from('profiles').insert({ id: testUserId, username: testUserId, display_name: 'Test Trigger User' });

    // Create a dummy game
    await supabase.from('game_list').insert({
      id: testGameId,
      user_id: testUserId,
      title: 'Test Trigger Game',
      status: 'playing',
      hours_played: 0
    });
  });

  afterAll(async () => {
    // Cleanup
    await supabase.from('game_list').delete().eq('id', testGameId);
    await supabase.from('profiles').delete().eq('id', testUserId);
  });

  it('should update hours_played when a session is inserted, and reset when deleted', async () => {
    // 1. Insert a session with 2.5 hours
    const { error: insertError } = await supabase.from('play_sessions').insert({
      game_id: testGameId,
      user_id: testUserId,
      minutes_played: 150,
      session_date: new Date().toISOString().slice(0, 10),
    });

    expect(insertError).toBeNull();

    // 2. Fetch the game and verify hours_played
    const { data: game1 } = await supabase.from('game_list').select('hours_played').eq('id', testGameId).single();
    expect(game1?.hours_played).toBe(2.5); // 150 menit = 2.5 jam (dikonversi oleh trigger)

    // 3. Insert another session with 1 hour
    await supabase.from('play_sessions').insert({
      game_id: testGameId,
      user_id: testUserId,
      minutes_played: 60,
      session_date: new Date().toISOString().slice(0, 10),
    });

    // 4. Fetch the game and verify hours_played is now 3.5
    const { data: game2 } = await supabase.from('game_list').select('hours_played').eq('id', testGameId).single();
    expect(game2?.hours_played).toBe(3.5); // 150 + 60 menit = 210 menit = 3.5 jam

    // 5. Delete all sessions for the game
    await supabase.from('play_sessions').delete().eq('game_id', testGameId);

    // 6. Fetch the game and verify hours_played is 0
    const { data: game3 } = await supabase.from('game_list').select('hours_played').eq('id', testGameId).single();
    expect(game3?.hours_played).toBe(0);
  });
});
