import { describe, it, expect, vi } from 'vitest';
import { getPublicProfileByUsername } from './profile';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('getPublicProfileByUsername', () => {
  it('should explicitly select public columns and not include sensitive data', async () => {
    const mockProfileSelect = vi.fn().mockReturnThis();
    const mockProfileEq = vi.fn().mockReturnThis();
    const mockProfileMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: 'test-id', display_name: 'Test', username: 'testuser', avatar_url: '', is_public: true },
      error: null,
    });

    const mockGamesSelect = vi.fn().mockReturnThis();
    const mockGamesEq = vi.fn().mockReturnThis();
    const mockGamesOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'game-1', title: 'Test Game' }],
      error: null,
    });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: mockProfileSelect,
          eq: mockProfileEq,
          maybeSingle: mockProfileMaybeSingle,
        };
      }
      if (table === 'game_list') {
        return {
          select: mockGamesSelect,
          eq: mockGamesEq,
          order: mockGamesOrder,
        };
      }
    });

    await getPublicProfileByUsername('testuser');

    expect(mockProfileSelect).toHaveBeenCalledWith('id, display_name, username, avatar_url, is_public');
    
    expect(mockGamesSelect).toHaveBeenCalledWith('id, title, cover_url, platforms, genres, status, hours_played, rating, release_year');
    
    const gamesSelectArg = mockGamesSelect.mock.calls[0][0];
    expect(gamesSelectArg).not.toContain('notes');
    expect(gamesSelectArg).not.toContain('review');
    expect(gamesSelectArg).not.toContain('price_paid');
  });
});
