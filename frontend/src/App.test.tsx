import { describe, it, expect } from 'vitest';

describe('App Smoke Test', () => {
  it('should pass a basic sanity check', () => {
    expect(true).toBe(true);
  });

  it('verifies that the testing environment is working', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(2, 2)).toBe(4);
  });
});
