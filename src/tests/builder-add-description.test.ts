import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addDescription', () => {
  it('should add description meta element', () => {
    const result = new HeadBuilder()
      .addDescription('A comprehensive guide')
      .build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'meta',
      attributes: { name: 'description', content: 'A comprehensive guide' },
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addDescription('desc')).toBe(builder);
  });
});
