import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';
import type { HeadElement } from '../types';

describe('HeadBuilder.addStylesheet', () => {
  it('should add stylesheet link with string URL', () => {
    const result = new HeadBuilder().addStylesheet('/styles.css').build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'link',
      attributes: { rel: 'stylesheet', type: 'text/css', href: '/styles.css' },
    });
  });

  it('should add stylesheet link with URL object', () => {
    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addStylesheet(new URL('https://cdn.example.com/theme.css'))
      .build();

    expect(result[0].attributes.href).toBe('https://cdn.example.com/theme.css');
  });

  it('should add stylesheet link with media attribute', () => {
    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addStylesheet('/print.css', { media: 'print' })
      .build();

    expect(result[0].attributes.media).toBe('print');
  });

  it('should add stylesheet link with integrity and crossOrigin', () => {
    const result = new HeadBuilder()
      .addStylesheet('https://cdn.example.com/styles.css', {
        integrity: 'sha384-abc123',
        crossOrigin: 'anonymous',
      })
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'stylesheet',
      type: 'text/css',
      href: 'https://cdn.example.com/styles.css',
      integrity: 'sha384-abc123',
      crossOrigin: 'anonymous',
    });
  });

  it('should add stylesheet link with multiple attributes', () => {
    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addStylesheet('/styles.css', {
        media: 'screen and (min-width: 768px)',
        fetchPriority: 'high',
      })
      .build();

    expect(result[0].attributes.media).toBe('screen and (min-width: 768px)');
    expect(result[0].attributes.fetchPriority).toBe('high');
  });

  it('should add multiple stylesheets', () => {
    const result = new HeadBuilder()
      .addStylesheet('/base.css')
      .addStylesheet('/theme.css')
      .build();

    expect(result).toHaveLength(2);
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addStylesheet('/styles.css')).toBe(builder);
  });
});
