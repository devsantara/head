import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';
import type { HeadElement } from '../types';

describe('HeadBuilder.addIcon', () => {
  it('should add icon with different presets (icon, apple, shortcut, custom)', () => {
    const presets: Array<{ preset: string; expectedRel: string }> = [
      { preset: 'icon', expectedRel: 'icon' },
      { preset: 'apple', expectedRel: 'apple-touch-icon' },
      { preset: 'shortcut', expectedRel: 'shortcut icon' },
      { preset: 'custom-icon', expectedRel: 'custom-icon' },
    ];

    for (const { preset, expectedRel } of presets) {
      const result = new HeadBuilder()
        .addIcon(preset, { href: '/favicon.ico' })
        .build();

      expect(result[0].attributes).toEqual({
        rel: expectedRel,
        href: '/favicon.ico',
      });
    }
  });

  it('should add icon with additional attributes', () => {
    const result = new HeadBuilder()
      .addIcon('icon', { href: '/icon.png', sizes: '32x32', type: 'image/png' })
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'icon',
      href: '/icon.png',
      sizes: '32x32',
      type: 'image/png',
    });
  });

  it('should add icon with URL object', () => {
    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addIcon('icon', { href: new URL('https://devsantara.com/favicon.ico') })
      .build();

    expect(result[0].attributes.href).toBe(
      'https://devsantara.com/favicon.ico',
    );
  });

  it('should add icon with callback using resolveUrl', () => {
    const result = new HeadBuilder({
      metadataBase: new URL('https://devsantara.com'),
    })
      .addIcon('apple', (h) => ({
        href: new URL(h.resolveUrl('/apple-icon.png')),
        sizes: '180x180',
      }))
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'apple-touch-icon',
      href: 'https://devsantara.com/apple-icon.png',
      sizes: '180x180',
    });
  });

  it('should add multiple icons with different sizes', () => {
    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addIcon('icon', { href: '/icon-16.png', sizes: '16x16' })
      .addIcon('icon', { href: '/icon-32.png', sizes: '32x32' })
      .build();

    expect(result).toHaveLength(2);
    expect(result[0].attributes.sizes).toBe('16x16');
    expect(result[1].attributes.sizes).toBe('32x32');
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addIcon('icon', { href: '/favicon.ico' })).toBe(builder);
  });
});
