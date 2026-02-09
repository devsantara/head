import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addCharSet', () => {
  it('should add charset meta element', () => {
    const result = new HeadBuilder().addCharSet('utf-8').build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'meta',
      attributes: { charSet: 'utf-8' },
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addCharSet('utf-8')).toBe(builder);
  });
});
