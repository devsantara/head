import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addColorScheme', () => {
  it('should add color-scheme meta for light, dark, and combined values', () => {
    const tests: Array<{
      value: 'light' | 'dark' | 'light dark';
      expected: string;
    }> = [
      { value: 'light', expected: 'light' },
      { value: 'dark', expected: 'dark' },
      { value: 'light dark', expected: 'light dark' },
    ];

    for (const { value, expected } of tests) {
      const result = new HeadBuilder().addColorScheme(value).build();
      expect(result[0]).toEqual({
        type: 'meta',
        attributes: { name: 'color-scheme', content: expected },
      });
    }
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addColorScheme('light')).toBe(builder);
  });
});
