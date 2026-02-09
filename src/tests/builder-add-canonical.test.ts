import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';

describe('HeadBuilder.addCanonical', () => {
  it('should add canonical link with string URL', () => {
    const result = new HeadBuilder()
      .addCanonical('https://devsantara.com/page')
      .build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'link',
      attributes: { rel: 'canonical', href: 'https://devsantara.com/page' },
    });
  });

  it('should add canonical link with URL object', () => {
    const result = new HeadBuilder()
      .addCanonical(new URL('https://devsantara.com/about'))
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'canonical',
      href: 'https://devsantara.com/about',
    });
  });

  it('should add canonical link with callback function using resolveUrl', () => {
    const result = new HeadBuilder({
      metadataBase: new URL('https://devsantara.com'),
    })
      .addCanonical((h) => h.resolveUrl('/page'))
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'canonical',
      href: 'https://devsantara.com/page',
    });
  });

  it('should add canonical link with callback returning URL object', () => {
    const result = new HeadBuilder()
      .addCanonical(() => new URL('https://other.com/page'))
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'canonical',
      href: 'https://other.com/page',
    });
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addCanonical('https://devsantara.com')).toBe(builder);
  });
});
