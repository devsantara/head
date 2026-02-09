import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addMeta', () => {
  it('should add meta element with name and content', () => {
    const result = new HeadBuilder()
      .addMeta({ name: 'theme-color', content: '#ffffff' })
      .build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'meta',
      attributes: { name: 'theme-color', content: '#ffffff' },
    });
  });

  it('should add meta element with property and content', () => {
    const result = new HeadBuilder()
      .addMeta({ property: 'og:title', content: 'My Page' })
      .build();

    expect(result[0]).toEqual({
      type: 'meta',
      attributes: { property: 'og:title', content: 'My Page' },
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addMeta({ name: 'test', content: 'val' })).toBe(builder);
  });
});
