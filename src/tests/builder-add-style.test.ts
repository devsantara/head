import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addStyle', () => {
  it('should add style element with CSS code', () => {
    const result = new HeadBuilder().addStyle('body { margin: 0; }').build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'style',
      attributes: { children: 'body { margin: 0; }', type: 'text/css' },
    });
  });

  it('should add style element with additional attributes', () => {
    const result = new HeadBuilder()
      .addStyle('body { margin: 0; }', { media: 'print' })
      .build();

    expect(result[0].attributes).toHaveProperty('media', 'print');
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addStyle('css')).toBe(builder);
  });
});
