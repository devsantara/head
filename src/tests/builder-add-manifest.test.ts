import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';
import type { HeadElement } from '../types';

describe('HeadBuilder.addManifest', () => {
  it('should add manifest link with string URL', () => {
    const result = new HeadBuilder().addManifest('/manifest.json').build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'link',
      attributes: { rel: 'manifest', href: '/manifest.json' },
    });
  });

  it('should add manifest link with URL object', () => {
    const result = new HeadBuilder()
      .addManifest(new URL('https://devsantara.com/manifest.webmanifest'))
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'manifest',
      href: 'https://devsantara.com/manifest.webmanifest',
    });
  });

  it('should add manifest link with callback using resolveUrl', () => {
    const result = new HeadBuilder({
      metadataBase: new URL('https://devsantara.com'),
    })
      .addManifest((h) => h.resolveUrl('/manifest.json'))
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'manifest',
      href: 'https://devsantara.com/manifest.json',
    });
  });

  it('should add manifest link with callback returning URL object', () => {
    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addManifest(() => new URL('https://other.com/manifest.json'))
      .build();

    expect(result[0].attributes.href).toBe('https://other.com/manifest.json');
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addManifest('/manifest.json')).toBe(builder);
  });
});
