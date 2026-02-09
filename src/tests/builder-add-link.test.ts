import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addLink', () => {
  it('should add link element with href only', () => {
    const result = new HeadBuilder().addLink('https://devsantara.com').build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'link',
      attributes: { href: 'https://devsantara.com' },
    });
  });

  it('should add link element with additional attributes', () => {
    const result = new HeadBuilder()
      .addLink('https://fonts.googleapis.com', {
        rel: 'preconnect',
        fetchPriority: 'high',
      })
      .build();

    expect(result[0]).toEqual({
      type: 'link',
      attributes: {
        href: 'https://fonts.googleapis.com',
        rel: 'preconnect',
        fetchPriority: 'high',
      },
    });
  });

  it('should add link element with URL object', () => {
    const result = new HeadBuilder()
      .addLink(new URL('https://devsantara.com/styles.css'), {
        rel: 'stylesheet',
      })
      .build();

    expect(result[0].attributes).toEqual({
      href: 'https://devsantara.com/styles.css',
      rel: 'stylesheet',
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addLink('https://devsantara.com')).toBe(builder);
  });
});
