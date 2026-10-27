import { afterEach, describe, expect, it, vi } from 'vitest';
import { GAME } from '../src/content/game';
import { createInitialState } from '../src/engine/game';
import { createSecureId } from '../src/engine/ids';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('secure run and command identifiers', () => {
  it('prefers the native UUID API when it is available', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    const randomUUID = vi.fn(() => id);
    const getRandomValues = vi.fn();
    vi.stubGlobal('crypto', { randomUUID, getRandomValues });

    expect(createSecureId()).toBe(id);
    expect(randomUUID).toHaveBeenCalledTimes(1);
    expect(getRandomValues).not.toHaveBeenCalled();
  });

  it.each([
    [Array(16).fill(0), '00000000-0000-4000-8000-000000000000'],
    [Array(16).fill(255), 'ffffffff-ffff-4fff-bfff-ffffffffffff'],
    [Array.from({ length: 16 }, (_, index) => index), '00010203-0405-4607-8809-0a0b0c0d0e0f'],
  ])('uses secure bytes with correct UUIDv4 version and variant bits on LAN HTTP', (values, expected) => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.set(values);
      return bytes;
    });
    const insecure = vi.spyOn(Math, 'random');
    vi.stubGlobal('crypto', { getRandomValues });

    const id = createSecureId();
    expect(id).toBe(expected);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(getRandomValues).toHaveBeenCalledTimes(1);
    expect(getRandomValues.mock.calls[0][0]).toBeInstanceOf(Uint8Array);
    expect(getRandomValues.mock.calls[0][0]).toHaveLength(16);
    expect(insecure).not.toHaveBeenCalled();
  });

  it('requests fresh secure entropy for each fallback identifier', () => {
    let requests = 0;
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.fill(0);
      bytes[0] = ++requests;
      return bytes;
    });
    vi.stubGlobal('crypto', { getRandomValues });

    expect(createSecureId()).not.toBe(createSecureId());
    expect(getRandomValues).toHaveBeenCalledTimes(2);
  });

  it('fails explicitly when no secure API is available', () => {
    const insecure = vi.spyOn(Math, 'random');
    vi.stubGlobal('crypto', undefined);

    expect(() => createSecureId()).toThrow('Secure randomness is unavailable');
    expect(insecure).not.toHaveBeenCalled();
  });

  it('creates a new run using the secure fallback without changing game setup', () => {
    vi.stubGlobal('crypto', { getRandomValues: (bytes: Uint8Array) => bytes.fill(0) });

    const state = createInitialState(GAME);
    expect(state.runId).toBe('00000000-0000-4000-8000-000000000000');
    expect(state.phase).toBe('creation');
    expect(state.capital).toBe(GAME.initialCapital);
    expect(state.baseStats).toEqual({ CR: 0, TA: 0, RE: 0, NE: 0, TS: 0 });
    expect(state.rolled).toEqual([]);
  });

  it('accepts caller-supplied string run IDs without requesting randomness', () => {
    vi.stubGlobal('crypto', undefined);

    expect(createInitialState(GAME, 'human-readable-test-run').runId).toBe('human-readable-test-run');
  });
});
