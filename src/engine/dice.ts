import type { DiceSource } from './types';
export type { DiceSource } from './types';

const D6_LIMIT = Math.floor(0x1_0000_0000 / 6) * 6;

/** Rejection sampling avoids the modulo bias of mapping every uint32 directly to a d6. */
export const rollD6: DiceSource = () => {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure randomness is unavailable in this browser.');
  }
  const bytes = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(bytes);
  } while (bytes[0] >= D6_LIMIT);
  return (bytes[0] % 6) + 1;
};

export function readDie(source: DiceSource = rollD6): number {
  const value = source();
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    throw new Error('A dice source must return an integer from 1 through 6.');
  }
  return value;
}

export function roll2D6(source: DiceSource = rollD6): [number, number] {
  return [readDie(source), readDie(source)];
}
