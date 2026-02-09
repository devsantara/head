import { describe, it, expect } from 'vitest';
import { HeadBuilder } from '../builder';
import type { HeadElement } from '../types';

describe('HeadBuilder.addAlternateLocale', () => {
  it('should add alternate locale links with single locale', () => {
    const result = new HeadBuilder()
      .addAlternateLocale({ 'en-US': 'https://devsantara.com/en' })
      .build();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'link',
      attributes: {
        rel: 'alternate',
        hrefLang: 'en-US',
        href: 'https://devsantara.com/en',
      },
    });
  });

  it('should add alternate locale links with multiple locales', () => {
    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addAlternateLocale({
        'en-US': 'https://devsantara.com/en',
        'fr-FR': 'https://devsantara.com/fr',
        'x-default': 'https://devsantara.com',
      })
      .build();

    expect(result).toHaveLength(3);
    expect(result[0].attributes.hrefLang).toBe('en-US');
    expect(result[1].attributes.hrefLang).toBe('fr-FR');
    expect(result[2].attributes.hrefLang).toBe('x-default');
  });

  it('should add alternate locale links with URL objects', () => {
    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addAlternateLocale({
        'en-US': new URL('https://devsantara.com/en'),
      })
      .build();

    expect(result[0].attributes.href).toBe('https://devsantara.com/en');
  });

  it('should add alternate locale links with callback using resolveUrl', () => {
    const result = new HeadBuilder({
      metadataBase: new URL('https://devsantara.com'),
    })
      .addAlternateLocale((h) => ({
        'en-US': h.resolveUrl('/en'),
        'fr-FR': h.resolveUrl('/fr'),
      }))
      .build();

    expect(result[0].attributes).toEqual({
      rel: 'alternate',
      hrefLang: 'en-US',
      href: 'https://devsantara.com/en',
    });
    expect(result[1].attributes).toEqual({
      rel: 'alternate',
      hrefLang: 'fr-FR',
      href: 'https://devsantara.com/fr',
    });
  });

  it('should support type-constrained locales', () => {
    type SupportedLocales = 'en-US' | 'fr-FR';

    const result = new HeadBuilder<HeadElement<'link'>[]>()
      .addAlternateLocale<SupportedLocales>({
        'en-US': '/en',
        'fr-FR': '/fr',
      })
      .build();

    expect(result).toHaveLength(2);
    expect(result[0].attributes.hrefLang).toBe('en-US');
    expect(result[1].attributes.hrefLang).toBe('fr-FR');
  });

  it('should return builder for chaining', () => {
    const builder = new HeadBuilder();
    expect(builder.addAlternateLocale({ 'en-US': '/en' })).toBe(builder);
  });
});
